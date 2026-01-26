;; Multi-Claim Aggregator Contract
;; Allows users to claim from multiple airdrop campaigns in a single transaction

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-claim-failed (err u101))
(define-constant err-invalid-campaign (err u102))
(define-constant err-already-claimed (err u103))
(define-constant err-too-many-claims (err u104))

;; Maximum claims per transaction
(define-constant max-claims-per-tx u10)

;; Data Variables
(define-data-var aggregator-active bool true)

;; Data Maps
(define-map aggregated-claims
  { user: principal, batch-id: uint }
  {
    total-claimed: uint,
    campaigns-count: uint,
    claim-block: uint,
    completed: bool
  }
)

(define-map campaign-claim-tracking
  { user: principal, campaign-type: (string-ascii 20), campaign-id: uint }
  { claimed: bool, amount: uint, claim-block: uint }
)

;; Read-Only Functions

(define-read-only (get-aggregated-claim (user principal) (batch-id uint))
  (map-get? aggregated-claims { user: user, batch-id: batch-id })
)

(define-read-only (has-claimed-campaign (user principal) (campaign-type (string-ascii 20)) (campaign-id uint))
  (match (map-get? campaign-claim-tracking { user: user, campaign-type: campaign-type, campaign-id: campaign-id })
    claim (get claimed claim)
    false
  )
)

(define-read-only (is-aggregator-active)
  (var-get aggregator-active)
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (mark-campaign-claimed (user principal) (campaign-type (string-ascii 20)) (campaign-id uint) (amount uint))
  (map-set campaign-claim-tracking
    { user: user, campaign-type: campaign-type, campaign-id: campaign-id }
    { claimed: true, amount: amount, claim-block: block-height }
  )
)

;; Public Functions

(define-public (claim-from-whitelist-airdrop (airdrop-id uint))
  (let
    (
      (user tx-sender)
    )
    (asserts! (var-get aggregator-active) err-claim-failed)
    (asserts! (not (has-claimed-campaign user "whitelist" airdrop-id)) err-already-claimed)
    
    ;; Call airdrop-manager contract to claim
    ;; In production, this would use contract-call? to the actual airdrop-manager
    ;; For now, we mark as claimed
    (mark-campaign-claimed user "whitelist" airdrop-id u0)
    (ok true)
  )
)

(define-public (claim-from-merkle-airdrop (root-id uint) (leaf (buff 32)) (proof (list 32 (buff 32))))
  (let
    (
      (user tx-sender)
    )
    (asserts! (var-get aggregator-active) err-claim-failed)
    (asserts! (not (has-claimed-campaign user "merkle" root-id)) err-already-claimed)
    
    ;; Call merkle-tree contract to verify and claim
    ;; In production, this would use contract-call? to verify proof
    (mark-campaign-claimed user "merkle" root-id u0)
    (ok true)
  )
)

(define-public (claim-from-vesting (schedule-id uint))
  (let
    (
      (user tx-sender)
    )
    (asserts! (var-get aggregator-active) err-claim-failed)
    
    ;; Call vesting-schedule contract to claim vested tokens
    ;; In production, this would use contract-call? to the vesting contract
    ;; Vesting can be claimed multiple times, so we don't check already-claimed
    (mark-campaign-claimed user "vesting" schedule-id u0)
    (ok true)
  )
)

(define-public (aggregate-multi-claim 
  (whitelist-airdrops (list 10 uint))
  (merkle-claims (list 10 { root-id: uint, leaf: (buff 32), proof: (list 32 (buff 32)) }))
  (vesting-schedules (list 10 uint))
)
  (let
    (
      (user tx-sender)
      (total-campaigns (+ (+ (len whitelist-airdrops) (len merkle-claims)) (len vesting-schedules)))
    )
    (asserts! (var-get aggregator-active) err-claim-failed)
    (asserts! (<= total-campaigns max-claims-per-tx) err-too-many-claims)
    
    ;; Process whitelist airdrops
    (map claim-whitelist-helper whitelist-airdrops)
    
    ;; Process merkle claims
    (map claim-merkle-helper merkle-claims)
    
    ;; Process vesting claims
    (map claim-vesting-helper vesting-schedules)
    
    ;; Record aggregated claim
    (map-set aggregated-claims
      { user: user, batch-id: block-height }
      {
        total-claimed: u0,
        campaigns-count: total-campaigns,
        claim-block: block-height,
        completed: true
      }
    )
    
    (ok total-campaigns)
  )
)

;; Helper functions for batch processing
(define-private (claim-whitelist-helper (airdrop-id uint))
  (begin
    (unwrap! (claim-from-whitelist-airdrop airdrop-id) false)
    true
  )
)

(define-private (claim-merkle-helper (claim-data { root-id: uint, leaf: (buff 32), proof: (list 32 (buff 32)) }))
  (begin
    (unwrap! (claim-from-merkle-airdrop 
      (get root-id claim-data)
      (get leaf claim-data)
      (get proof claim-data)
    ) false)
    true
  )
)

(define-private (claim-vesting-helper (schedule-id uint))
  (begin
    (unwrap! (claim-from-vesting schedule-id) false)
    true
  )
)

;; Admin Functions

(define-public (activate-aggregator)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set aggregator-active true)
    (ok true)
  )
)

(define-public (deactivate-aggregator)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set aggregator-active false)
    (ok true)
  )
)
