;; Analytics and Tracking Contract
;; Tracks airdrop metrics and statistics

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))

;; Data Variables
(define-data-var total-airdrops uint u0)
(define-data-var total-addresses-whitelisted uint u0)
(define-data-var total-tokens-distributed uint u0)
(define-data-var total-claims uint u0)

;; Data Maps
(define-map airdrop-stats
  uint
  {
    airdrop-id: uint,
    total-allocated: uint,
    total-claimed: uint,
    unique-claimants: uint,
    created-at: uint
  }
)

(define-map user-claim-history
  { airdrop-id: uint, user: principal }
  {
    amount-claimed: uint,
    claim-count: uint,
    first-claim: uint,
    last-claim: uint
  }
)

;; Read-Only Functions

(define-read-only (get-airdrop-stats (airdrop-id uint))
  (map-get? airdrop-stats airdrop-id)
)

(define-read-only (get-user-history (airdrop-id uint) (user principal))
  (map-get? user-claim-history { airdrop-id: airdrop-id, user: user })
)

(define-read-only (get-total-airdrops)
  (var-get total-airdrops)
)

(define-read-only (get-total-distributed)
  (var-get total-tokens-distributed)
)

(define-read-only (get-total-claims)
  (var-get total-claims)
)

(define-read-only (get-whitelisted-count)
  (var-get total-addresses-whitelisted)
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions

(define-public (record-airdrop (airdrop-id uint) (total-allocated uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set airdrop-stats airdrop-id
      {
        airdrop-id: airdrop-id,
        total-allocated: total-allocated,
        total-claimed: u0,
        unique-claimants: u0,
        created-at: block-height
      }
    )
    
    (var-set total-airdrops (+ (var-get total-airdrops) u1))
    (ok true)
  )
)

(define-public (record-claim (airdrop-id uint) (user principal) (amount uint))
  (let
    (
      (current-history (map-get? user-claim-history { airdrop-id: airdrop-id, user: user }))
      (current-stats (map-get? airdrop-stats airdrop-id))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    ;; Update user history
    (match current-history
      history
      (map-set user-claim-history { airdrop-id: airdrop-id, user: user }
        {
          amount-claimed: (+ (get amount-claimed history) amount),
          claim-count: (+ (get claim-count history) u1),
          first-claim: (get first-claim history),
          last-claim: block-height
        }
      )
      (map-set user-claim-history { airdrop-id: airdrop-id, user: user }
        {
          amount-claimed: amount,
          claim-count: u1,
          first-claim: block-height,
          last-claim: block-height
        }
      )
    )
    
    ;; Update airdrop stats
    (match current-stats
      stats
      (map-set airdrop-stats airdrop-id
        {
          airdrop-id: airdrop-id,
          total-allocated: (get total-allocated stats),
          total-claimed: (+ (get total-claimed stats) amount),
          unique-claimants: (+ (get unique-claimants stats) u1),
          created-at: (get created-at stats)
        }
      )
      true
    )
    
    ;; Update global stats
    (var-set total-tokens-distributed (+ (var-get total-tokens-distributed) amount))
    (var-set total-claims (+ (var-get total-claims) u1))
    
    (ok true)
  )
)

(define-public (record-whitelist-addition)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set total-addresses-whitelisted (+ (var-get total-addresses-whitelisted) u1))
    (ok true)
  )
)
