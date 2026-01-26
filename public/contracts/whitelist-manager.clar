;; Whitelist Manager Contract
;; Manages whitelisted addresses for airdrop eligibility

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-already-whitelisted (err u101))
(define-constant err-not-whitelisted (err u102))
(define-constant err-invalid-address (err u103))

;; Data Variables
(define-data-var total-whitelisted uint u0)
(define-data-var whitelist-active bool true)

;; Data Maps
(define-map whitelist
  principal
  {
    whitelisted: bool,
    added-at: uint,
    tier: uint
  }
)

(define-map whitelist-metadata
  uint
  {
    tier-name: (string-ascii 50),
    max-allocation: uint
  }
)

;; Read-Only Functions

(define-read-only (is-whitelisted (address principal))
  (match (map-get? whitelist address)
    entry (get whitelisted entry)
    false
  )
)

(define-read-only (get-whitelist-info (address principal))
  (map-get? whitelist address)
)

(define-read-only (get-total-whitelisted)
  (var-get total-whitelisted)
)

(define-read-only (is-whitelist-active)
  (var-get whitelist-active)
)

(define-read-only (get-tier-metadata (tier uint))
  (map-get? whitelist-metadata tier)
)

(define-read-only (get-contract-owner)
  contract-owner
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions

(define-public (add-to-whitelist (address principal) (tier uint))
  (let
    (
      (current-entry (map-get? whitelist address))
    )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (not (is-eq address contract-owner)) err-invalid-address)
    
    (match current-entry
      entry
      ;; Address exists, update if not already whitelisted
      (begin
        (asserts! (not (get whitelisted entry)) err-already-whitelisted)
        (map-set whitelist address
          {
            whitelisted: true,
            added-at: block-height,
            tier: tier
          }
        )
        (var-set total-whitelisted (+ (var-get total-whitelisted) u1))
        (ok true)
      )
      ;; New address
      (begin
        (map-set whitelist address
          {
            whitelisted: true,
            added-at: block-height,
            tier: tier
          }
        )
        (var-set total-whitelisted (+ (var-get total-whitelisted) u1))
        (ok true)
      )
    )
  )
)

(define-public (batch-add-to-whitelist (addresses (list 200 principal)) (tier uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (ok (map add-to-whitelist-helper addresses (list 
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
      tier tier tier tier tier tier tier tier tier tier
    )))
  )
)

(define-private (add-to-whitelist-helper (address principal) (tier uint))
  (begin
    (map-set whitelist address
      {
        whitelisted: true,
        added-at: block-height,
        tier: tier
      }
    )
    true
  )
)

(define-public (remove-from-whitelist (address principal))
  (let
    (
      (current-entry (unwrap! (map-get? whitelist address) err-not-whitelisted))
    )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (get whitelisted current-entry) err-not-whitelisted)
    
    (map-set whitelist address
      (merge current-entry { whitelisted: false })
    )
    (var-set total-whitelisted (- (var-get total-whitelisted) u1))
    (ok true)
  )
)

(define-public (batch-remove-from-whitelist (addresses (list 200 principal)))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (ok (map remove-from-whitelist-helper addresses))
  )
)

(define-private (remove-from-whitelist-helper (address principal))
  (match (map-get? whitelist address)
    entry
    (if (get whitelisted entry)
      (begin
        (map-set whitelist address
          (merge entry { whitelisted: false })
        )
        true
      )
      false
    )
    false
  )
)

(define-public (set-tier-metadata (tier uint) (tier-name (string-ascii 50)) (max-allocation uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (map-set whitelist-metadata tier
      {
        tier-name: tier-name,
        max-allocation: max-allocation
      }
    )
    (ok true)
  )
)

(define-public (activate-whitelist)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set whitelist-active true)
    (ok true)
  )
)

(define-public (deactivate-whitelist)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set whitelist-active false)
    (ok true)
  )
)

;; Initialize default tiers
(begin
  (map-set whitelist-metadata u1
    {
      tier-name: "Bronze",
      max-allocation: u1000000000
    }
  )
  (map-set whitelist-metadata u2
    {
      tier-name: "Silver",
      max-allocation: u5000000000
    }
  )
  (map-set whitelist-metadata u3
    {
      tier-name: "Gold",
      max-allocation: u10000000000
    }
  )
)
