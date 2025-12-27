;; OnChainResume on Stacks (Bitcoin L2)
;; Smart Contract for storing verified achievements and credentials on Bitcoin
;; with Stacks (STX) cryptocurrency integration

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-PROFILE-EXISTS (err u101))
(define-constant ERR-PROFILE-NOT-FOUND (err u102))
(define-constant ERR-INVALID-HANDLE (err u103))
(define-constant ERR-HANDLE-TAKEN (err u104))
(define-constant ERR-NO-CREDENTIALS (err u105))
(define-constant ERR-CREDENTIAL-NOT-FOUND (err u106))
(define-constant ERR-ALREADY-VERIFIED (err u107))
(define-constant ERR-UNAUTHORIZED (err u108))

;; Constants for reputation and rewards
(define-constant PROFILE-CREATION-REWARD u50)
(define-constant CREDENTIAL-VERIFICATION-REWARD u100)
(define-constant ACHIEVEMENT-REWARD u25)

;; Define profile structure
(define-map profiles
  { user: principal }
  {
    owner: principal,
    handle: (string-ascii 50),
    ipfs-hash: (string-ascii 100),
    created-at: uint,
    updated-at: uint,
    reputation-score: uint,
    verified: bool,
    total-credentials: uint,
    total-achievements: uint
  }
)

;; Handle to principal mapping for lookups
(define-map handle-to-principal
  { handle: (string-ascii 50) }
  { principal: principal }
)

;; Store credentials with multi-index support
(define-map credentials
  { user: principal, credential-id: uint }
  {
    credential-type: (string-ascii 50),
    issuer: (string-ascii 100),
    issued-date: uint,
    expiry-date: uint,
    proof-url: (string-ascii 200),
    verified: bool,
    verification-count: uint
  }
)

;; Track verifications to prevent double-verification
(define-map verifications
  { verifier: principal, user: principal, credential-id: uint }
  { verified: bool }
)

;; Store achievements
(define-map achievements
  { user: principal, achievement-id: uint }
  {
    title: (string-ascii 100),
    description: (string-ascii 500),
    achievement-type: (string-ascii 50),
    unlocked-at: uint,
    verified: bool,
    points: uint
  }
)

;; Verifier registry
(define-map verifiers
  { verifier: principal }
  {
    name: (string-ascii 100),
    specialty: (string-ascii 100),
    verification-count: uint,
    is-active: bool,
    joined-at: uint
  }
)

;; Counters for IDs
(define-data-var user-count uint u0)
(define-data-var total-credentials uint u0)
(define-data-var total-achievements uint u0)
(define-data-var total-verifications uint u0)

;; ============ Events (via contract state changes) ============

;; ============ Profile Functions ============

;; Create a new profile
(define-public (create-profile (handle (string-ascii 50)) (ipfs-hash (string-ascii 100)))
  (let
    (
      (user tx-sender)
      (profile-exists (map-get? profiles { user: user }))
      (handle-exists (map-get? handle-to-principal { handle: handle }))
    )
    ;; Check if profile already exists
    (if (is-some profile-exists)
      ERR-PROFILE-EXISTS
      ;; Check if handle is taken
      (if (is-some handle-exists)
        ERR-HANDLE-TAKEN
        ;; Create profile
        (begin
          (map-insert profiles
            { user: user }
            {
              owner: user,
              handle: handle,
              ipfs-hash: ipfs-hash,
              created-at: block-height,
              updated-at: block-height,
              reputation-score: PROFILE-CREATION-REWARD,
              verified: false,
              total-credentials: u0,
              total-achievements: u0
            }
          )
          (map-insert handle-to-principal { handle: handle } { principal: user })
          (var-set user-count (+ (var-get user-count) u1))
          (ok true)
        )
      )
    )
  )
)

;; Update profile IPFS hash
(define-public (update-profile (ipfs-hash (string-ascii 100)))
  (let
    (
      (user tx-sender)
      (profile (map-get? profiles { user: user }))
    )
    (match profile
      profile-data
      (begin
        (map-set profiles
          { user: user }
          (merge profile-data { ipfs-hash: ipfs-hash, updated-at: block-height })
        )
        (ok true)
      )
      ERR-PROFILE-NOT-FOUND
    )
  )
)

;; Get profile by principal
(define-read-only (get-profile (user principal))
  (map-get? profiles { user: user })
)

;; Get principal by handle
(define-read-only (get-user-by-handle (handle (string-ascii 50)))
  (map-get? handle-to-principal { handle: handle })
)

;; ============ Credential Functions ============

;; Add credential to profile
(define-public (add-credential
  (credential-type (string-ascii 50))
  (issuer (string-ascii 100))
  (issued-date uint)
  (expiry-date uint)
  (proof-url (string-ascii 200))
)
  (let
    (
      (user tx-sender)
      (profile (map-get? profiles { user: user }))
      (credential-id (var-get total-credentials))
    )
    (match profile
      profile-data
      (begin
        (map-insert credentials
          { user: user, credential-id: credential-id }
          {
            credential-type: credential-type,
            issuer: issuer,
            issued-date: issued-date,
            expiry-date: expiry-date,
            proof-url: proof-url,
            verified: false,
            verification-count: u0
          }
        )
        (map-set profiles
          { user: user }
          (merge profile-data { total-credentials: (+ (get total-credentials profile-data) u1) })
        )
        (var-set total-credentials (+ credential-id u1))
        (ok credential-id)
      )
      ERR-PROFILE-NOT-FOUND
    )
  )
)

;; Verify credential
(define-public (verify-credential (user principal) (credential-id uint))
  (let
    (
      (verifier tx-sender)
      (credential (map-get? credentials { user: user, credential-id: credential-id }))
      (already-verified (map-get? verifications { verifier: verifier, user: user, credential-id: credential-id }))
    )
    (if (is-some already-verified)
      ERR-ALREADY-VERIFIED
      (match credential
        cred-data
        (let
          (
            (new-verification-count (+ (get verification-count cred-data) u1))
            (is-verified (>= new-verification-count u2))
          )
          (begin
            (map-insert verifications
              { verifier: verifier, user: user, credential-id: credential-id }
              { verified: true }
            )
            (map-set credentials
              { user: user, credential-id: credential-id }
              (merge cred-data
                {
                  verification-count: new-verification-count,
                  verified: is-verified
                }
              )
            )
            (var-set total-verifications (+ (var-get total-verifications) u1))
            (ok true)
          )
        )
        ERR-CREDENTIAL-NOT-FOUND
      )
    )
  )
)

;; ============ Achievement Functions ============

;; Unlock achievement
(define-public (unlock-achievement
  (title (string-ascii 100))
  (description (string-ascii 500))
  (achievement-type (string-ascii 50))
  (points uint)
)
  (let
    (
      (user tx-sender)
      (profile (map-get? profiles { user: user }))
      (achievement-id (var-get total-achievements))
    )
    (match profile
      profile-data
      (begin
        (map-insert achievements
          { user: user, achievement-id: achievement-id }
          {
            title: title,
            description: description,
            achievement-type: achievement-type,
            unlocked-at: block-height,
            verified: false,
            points: points
          }
        )
        (map-set profiles
          { user: user }
          (merge profile-data
            {
              total-achievements: (+ (get total-achievements profile-data) u1),
              reputation-score: (+ (get reputation-score profile-data) points)
            }
          )
        )
        (var-set total-achievements (+ achievement-id u1))
        (ok achievement-id)
      )
      ERR-PROFILE-NOT-FOUND
    )
  )
)

;; ============ Verifier Functions ============

;; Register as verifier
(define-public (register-as-verifier (name (string-ascii 100)) (specialty (string-ascii 100)))
  (let
    (
      (verifier tx-sender)
    )
    (map-set verifiers
      { verifier: verifier }
      {
        name: name,
        specialty: specialty,
        verification-count: u0,
        is-active: true,
        joined-at: block-height
      }
    )
    (ok true)
  )
)

;; Get verifier info
(define-read-only (get-verifier-info (verifier principal))
  (map-get? verifiers { verifier: verifier })
)

;; ============ Reputation Functions ============

;; Get reputation score
(define-read-only (get-reputation (user principal))
  (let ((profile (map-get? profiles { user: user })))
    (match profile
      profile-data (ok (get reputation-score profile-data))
      (err u0)
    )
  )
)

;; Update reputation (contract owner only)
(define-public (update-reputation (user principal) (new-score uint))
  (if (is-eq tx-sender CONTRACT-OWNER)
    (let ((profile (map-get? profiles { user: user })))
      (match profile
        profile-data
        (begin
          (map-set profiles
            { user: user }
            (merge profile-data { reputation-score: new-score })
          )
          (ok true)
        )
        ERR-PROFILE-NOT-FOUND
      )
    )
    ERR-NOT-OWNER
  )
)

;; ============ View Functions ============

;; Get user count
(define-read-only (get-user-count)
  (var-get user-count)
)

;; Get total credentials
(define-read-only (get-total-credentials)
  (var-get total-credentials)
)

;; Get total achievements
(define-read-only (get-total-achievements)
  (var-get total-achievements)
)

;; Get total verifications
(define-read-only (get-total-verifications)
  (var-get total-verifications)
)

;; Check if handle is available
(define-read-only (is-handle-available (handle (string-ascii 50)))
  (is-none (map-get? handle-to-principal { handle: handle }))
)

;; Get credential details
(define-read-only (get-credential (user principal) (credential-id uint))
  (map-get? credentials { user: user, credential-id: credential-id })
)

;; Get achievement details
(define-read-only (get-achievement (user principal) (achievement-id uint))
  (map-get? achievements { user: user, achievement-id: achievement-id })
)
