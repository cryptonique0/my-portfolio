;; Vesting Schedule Contract
;; Allows for time-locked token distributions with cliff and linear vesting

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-nothing-to-claim (err u103))
(define-constant err-invalid-schedule (err u104))

;; Data Variables
(define-data-var schedule-counter uint u0)

;; Data Maps
(define-map vesting-schedules
  uint
  {
    beneficiary: principal,
    total-amount: uint,
    claimed-amount: uint,
    start-block: uint,
    cliff-block: uint,
    end-block: uint,
    active: bool
  }
)

(define-map schedule-claims
  { schedule-id: uint, beneficiary: principal }
  { claimed-amount: uint, last-claim-block: uint }
)

;; Read-Only Functions

(define-read-only (get-vesting-schedule (schedule-id uint))
  (map-get? vesting-schedules schedule-id)
)

(define-read-only (get-claimed-amount (schedule-id uint) (beneficiary principal))
  (default-to 
    { claimed-amount: u0, last-claim-block: u0 }
    (map-get? schedule-claims { schedule-id: schedule-id, beneficiary: beneficiary })
  )
)

(define-read-only (calculate-vested (schedule-id uint))
  (match (map-get? vesting-schedules schedule-id)
    schedule
    (if (< block-height (get cliff-block schedule))
      u0
      (let
        (
          (elapsed (- (min block-height (get end-block schedule)) (get cliff-block schedule)))
          (total-duration (- (get end-block schedule) (get cliff-block schedule)))
          (vested-percentage (/ (* elapsed u100) total-duration))
        )
        (/ (* (get total-amount schedule) vested-percentage) u100)
      )
    )
    u0
  )
)

(define-read-only (get-claimable-amount (schedule-id uint) (beneficiary principal))
  (match (map-get? vesting-schedules schedule-id)
    schedule
    (let
      (
        (vested (calculate-vested schedule-id))
        (already-claimed (get claimed-amount (get-claimed-amount schedule-id beneficiary)))
      )
      (if (> vested already-claimed)
        (- vested already-claimed)
        u0
      )
    )
    u0
  )
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions

(define-public (create-vesting-schedule
  (beneficiary principal)
  (total-amount uint)
  (start-block uint)
  (cliff-block uint)
  (end-block uint)
)
  (let
    (
      (new-schedule-id (+ (var-get schedule-counter) u1))
    )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (< start-block cliff-block) err-invalid-schedule)
    (asserts! (< cliff-block end-block) err-invalid-schedule)
    (asserts! (> total-amount u0) err-invalid-schedule)
    
    (map-set vesting-schedules new-schedule-id
      {
        beneficiary: beneficiary,
        total-amount: total-amount,
        claimed-amount: u0,
        start-block: start-block,
        cliff-block: cliff-block,
        end-block: end-block,
        active: true
      }
    )
    
    (var-set schedule-counter new-schedule-id)
    (ok new-schedule-id)
  )
)

(define-public (claim-vested-tokens (schedule-id uint))
  (let
    (
      (schedule (unwrap! (map-get? vesting-schedules schedule-id) err-not-found))
      (claimable (get-claimable-amount schedule-id tx-sender))
      (claim-info (get-claimed-amount schedule-id tx-sender))
    )
    (asserts! (is-eq tx-sender (get beneficiary schedule)) err-not-found)
    (asserts! (get active schedule) err-not-found)
    (asserts! (> claimable u0) err-nothing-to-claim)
    
    ;; Update claim record
    (map-set schedule-claims
      { schedule-id: schedule-id, beneficiary: tx-sender }
      {
        claimed-amount: (+ (get claimed-amount claim-info) claimable),
        last-claim-block: block-height
      }
    )
    
    ;; Update schedule
    (map-set vesting-schedules schedule-id
      (merge schedule { claimed-amount: (+ (get claimed-amount schedule) claimable) })
    )
    
    (ok claimable)
  )
)

(define-public (deactivate-schedule (schedule-id uint))
  (let
    (
      (schedule (unwrap! (map-get? vesting-schedules schedule-id) err-not-found))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set vesting-schedules schedule-id
      (merge schedule { active: false })
    )
    (ok true)
  )
)

(define-public (activate-schedule (schedule-id uint))
  (let
    (
      (schedule (unwrap! (map-get? vesting-schedules schedule-id) err-not-found))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set vesting-schedules schedule-id
      (merge schedule { active: true })
    )
    (ok true)
  )
)
