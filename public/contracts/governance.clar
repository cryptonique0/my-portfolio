;; Governance and DAO Contract
;; Allows community voting on airdrop parameters and upgrades

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-proposal-not-found (err u101))
(define-constant err-already-voted (err u102))
(define-constant err-voting-closed (err u103))
(define-constant err-not-eligible (err u104))

;; Data Variables
(define-data-var proposal-counter uint u0)
(define-data-var governance-active bool true)

;; Data Maps
(define-map proposals
  uint
  {
    title: (string-ascii 100),
    description: (string-ascii 500),
    proposer: principal,
    yes-votes: uint,
    no-votes: uint,
    start-block: uint,
    end-block: uint,
    executed: bool,
    active: bool
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  { voted: bool, position: bool, vote-block: uint }
)

(define-map governance-tokens
  principal
  uint
)

;; Read-Only Functions

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id)
)

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (match (map-get? votes { proposal-id: proposal-id, voter: voter })
    vote (get voted vote)
    false
  )
)

(define-read-only (get-governance-balance (holder principal))
  (default-to u0 (map-get? governance-tokens holder))
)

(define-read-only (is-proposal-active (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
    (and 
      (get active proposal)
      (< block-height (get end-block proposal))
    )
    false
  )
)

(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
    (if (> (get yes-votes proposal) (get no-votes proposal))
      (ok "PASSED")
      (ok "FAILED")
    )
    err-proposal-not-found
  )
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions

(define-public (create-proposal
  (title (string-ascii 100))
  (description (string-ascii 500))
  (duration uint)
)
  (let
    (
      (new-proposal-id (+ (var-get proposal-counter) u1))
      (voter-balance (get-governance-balance tx-sender))
    )
    (asserts! (var-get governance-active) err-not-eligible)
    (asserts! (> voter-balance u0) err-not-eligible)
    
    (map-set proposals new-proposal-id
      {
        title: title,
        description: description,
        proposer: tx-sender,
        yes-votes: u0,
        no-votes: u0,
        start-block: block-height,
        end-block: (+ block-height duration),
        executed: false,
        active: true
      }
    )
    
    (var-set proposal-counter new-proposal-id)
    (ok new-proposal-id)
  )
)

(define-public (vote-on-proposal (proposal-id uint) (position bool))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
      (voter-balance (get-governance-balance tx-sender))
    )
    (asserts! (is-proposal-active proposal-id) err-voting-closed)
    (asserts! (not (has-voted proposal-id tx-sender)) err-already-voted)
    (asserts! (> voter-balance u0) err-not-eligible)
    
    ;; Record vote
    (map-set votes
      { proposal-id: proposal-id, voter: tx-sender }
      { voted: true, position: position, vote-block: block-height }
    )
    
    ;; Update proposal vote counts
    (if position
      ;; Yes vote
      (map-set proposals proposal-id
        (merge proposal { yes-votes: (+ (get yes-votes proposal) voter-balance) })
      )
      ;; No vote
      (map-set proposals proposal-id
        (merge proposal { no-votes: (+ (get no-votes proposal) voter-balance) })
      )
    )
    
    (ok true)
  )
)

(define-public (mint-governance-tokens (amount uint) (recipient principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> amount u0) err-not-eligible)
    
    (map-set governance-tokens recipient
      (+ (get-governance-balance recipient) amount)
    )
    (ok true)
  )
)

(define-public (burn-governance-tokens (amount uint))
  (let
    (
      (current-balance (get-governance-balance tx-sender))
    )
    (asserts! (>= current-balance amount) err-not-eligible)
    
    (map-set governance-tokens tx-sender
      (- current-balance amount)
    )
    (ok true)
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (>= block-height (get end-block proposal)) err-voting-closed)
    (asserts! (not (get executed proposal)) err-proposal-not-found)
    (asserts! (> (get yes-votes proposal) (get no-votes proposal)) err-not-eligible)
    
    (map-set proposals proposal-id
      (merge proposal { executed: true })
    )
    (ok true)
  )
)

(define-public (disable-governance)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set governance-active false)
    (ok true)
  )
)

(define-public (enable-governance)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set governance-active true)
    (ok true)
  )
)
