;; Merkle Tree Verification Contract
;; Enables efficient proof-based token claims using merkle trees

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-proof (err u101))
(define-constant err-invalid-leaf (err u102))
(define-constant err-root-not-found (err u103))

;; Data Variables
(define-data-var root-counter uint u0)

;; Data Maps
(define-map merkle-roots
  uint
  {
    root: (buff 32),
    created-at: uint,
    active: bool
  }
)

(define-map leaf-claims
  { root-id: uint, leaf-hash: (buff 32) }
  { claimed: bool, claim-block: uint }
)

;; Read-Only Functions

(define-read-only (get-merkle-root (root-id uint))
  (map-get? merkle-roots root-id)
)

(define-read-only (is-root-active (root-id uint))
  (match (map-get? merkle-roots root-id)
    root (get active root)
    false
  )
)

(define-read-only (has-leaf-claimed (root-id uint) (leaf-hash (buff 32)))
  (match (map-get? leaf-claims { root-id: root-id, leaf-hash: leaf-hash })
    claim (get claimed claim)
    false
  )
)

(define-read-only (verify-proof (root-id uint) (leaf (buff 32)) (proof (list 32 (buff 32))))
  (match (map-get? merkle-roots root-id)
    root-data
    (is-eq (get root root-data) (calculate-merkle-root leaf proof))
    false
  )
)

;; Private Functions

(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (hash-pair (left (buff 32)) (right (buff 32)))
  (sha256 (concat left right))
)

(define-private (calculate-merkle-root (leaf (buff 32)) (proof (list 32 (buff 32))))
  (fold calculate-merkle-root-helper proof leaf)
)

(define-private (calculate-merkle-root-helper (proof-element (buff 32)) (current-hash (buff 32)))
  (hash-pair current-hash proof-element)
)

;; Public Functions

(define-public (register-merkle-root (root (buff 32)))
  (let
    (
      (new-root-id (+ (var-get root-counter) u1))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set merkle-roots new-root-id
      {
        root: root,
        created-at: block-height,
        active: true
      }
    )
    
    (var-set root-counter new-root-id)
    (ok new-root-id)
  )
)

(define-public (mark-leaf-claimed (root-id uint) (leaf-hash (buff 32)))
  (begin
    (asserts! (is-root-active root-id) err-root-not-found)
    (asserts! (not (has-leaf-claimed root-id leaf-hash)) err-invalid-leaf)
    
    (map-set leaf-claims
      { root-id: root-id, leaf-hash: leaf-hash }
      { claimed: true, claim-block: block-height }
    )
    (ok true)
  )
)

(define-public (deactivate-root (root-id uint))
  (let
    (
      (root (unwrap! (map-get? merkle-roots root-id) err-root-not-found))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set merkle-roots root-id
      (merge root { active: false })
    )
    (ok true)
  )
)

(define-public (activate-root (root-id uint))
  (let
    (
      (root (unwrap! (map-get? merkle-roots root-id) err-root-not-found))
    )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set merkle-roots root-id
      (merge root { active: true })
    )
    (ok true)
  )
)
