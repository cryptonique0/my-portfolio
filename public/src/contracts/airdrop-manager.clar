
;; Airdrop Manager Contract
;; Manages token airdrops with whitelist verification and claim functionality

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-whitelisted (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-airdrop-not-active (err u103))
(define-constant err-airdrop-not-found (err u104))
(define-constant err-insufficient-balance (err u105))
(define-constant err-invalid-amount (err u106))
(define-constant err-paused (err u107))
(define-constant err-list-length-mismatch (err u108))

;; Data Variables
(define-data-var airdrop-counter uint u0)
(define-data-var paused bool false)

;; Data Maps
(define-map airdrops
	uint
	{
		token-contract: principal,
		total-amount: uint,
		claimed-amount: uint,
		start-block: uint,
		end-block: uint,
		active: bool,
		creator: principal
	}
)

(define-map claims
	{ airdrop-id: uint, recipient: principal }
	{ claimed: bool, amount: uint, claim-block: uint }
)

(define-map airdrop-allocations
	{ airdrop-id: uint, recipient: principal }
	uint
)

;; Read-Only Functions

(define-read-only (get-airdrop (airdrop-id uint))
	(map-get? airdrops airdrop-id)
)

(define-read-only (has-claimed (airdrop-id uint) (recipient principal))
	(default-to 
		{ claimed: false, amount: u0, claim-block: u0 }
		(map-get? claims { airdrop-id: airdrop-id, recipient: recipient })
	)
)

(define-read-only (get-allocation (airdrop-id uint) (recipient principal))
	(default-to u0 (map-get? airdrop-allocations { airdrop-id: airdrop-id, recipient: recipient }))
)

(define-read-only (is-airdrop-active (airdrop-id uint))
	(match (map-get? airdrops airdrop-id)
		airdrop (and 
							(get active airdrop)
							(>= block-height (get start-block airdrop))
							(<= block-height (get end-block airdrop))
						)
		false
	)
)

(define-read-only (get-contract-owner)
	contract-owner
)

(define-read-only (is-paused)
	(var-get paused)
)

;; Private Functions

(define-private (is-contract-owner)
	(is-eq tx-sender contract-owner)
)

;; Public Functions

(define-public (create-airdrop 
	(token-contract principal)
	(total-amount uint)
	(start-block uint)
	(end-block uint)
)
	(let
		(
			(new-airdrop-id (+ (var-get airdrop-counter) u1))
		)
		(asserts! (is-contract-owner) err-owner-only)
		(asserts! (> total-amount u0) err-invalid-amount)
		(asserts! (< start-block end-block) err-invalid-amount)
    
		(map-set airdrops new-airdrop-id
			{
				token-contract: token-contract,
				total-amount: total-amount,
				claimed-amount: u0,
				start-block: start-block,
				end-block: end-block,
				active: true,
				creator: tx-sender
			}
		)
    
		(var-set airdrop-counter new-airdrop-id)
		(ok new-airdrop-id)
	)
)

(define-public (set-allocation 
	(airdrop-id uint)
	(recipient principal)
	(amount uint)
)
	(begin
		(asserts! (is-contract-owner) err-owner-only)
		(asserts! (is-some (map-get? airdrops airdrop-id)) err-airdrop-not-found)
		(asserts! (> amount u0) err-invalid-amount)
    
		(map-set airdrop-allocations 
			{ airdrop-id: airdrop-id, recipient: recipient }
			amount
		)
		(ok true)
	)
)

(define-public (batch-set-allocations
	(airdrop-id uint)
	(recipients (list 200 principal))
	(amounts (list 200 uint))
)
	(begin
		(asserts! (is-contract-owner) err-owner-only)
		(asserts! (is-some (map-get? airdrops airdrop-id)) err-airdrop-not-found)
		(asserts! (is-eq (len recipients) (len amounts)) err-list-length-mismatch)
    
		(ok (map set-allocation-helper 
			recipients 
			amounts
			(list 
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
				airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id airdrop-id
			)
		))
	)
)

(define-private (set-allocation-helper (recipient principal) (amount uint) (airdrop-id uint))
	(begin
		(map-set airdrop-allocations 
			{ airdrop-id: airdrop-id, recipient: recipient }
			amount
		)
		true
	)
)

(define-public (claim-tokens (airdrop-id uint))
	(let
		(
			(airdrop (unwrap! (map-get? airdrops airdrop-id) err-airdrop-not-found))
			(allocation (unwrap! (map-get? airdrop-allocations { airdrop-id: airdrop-id, recipient: tx-sender }) err-not-whitelisted))
			(claim-info (has-claimed airdrop-id tx-sender))
		)
		(asserts! (not (var-get paused)) err-paused)
		(asserts! (is-airdrop-active airdrop-id) err-airdrop-not-active)
		(asserts! (not (get claimed claim-info)) err-already-claimed)
		(asserts! (> allocation u0) err-invalid-amount)
    
		;; Mark as claimed
		(map-set claims
			{ airdrop-id: airdrop-id, recipient: tx-sender }
			{ claimed: true, amount: allocation, claim-block: block-height }
		)
    
		;; Update claimed amount
		(map-set airdrops airdrop-id
			(merge airdrop { claimed-amount: (+ (get claimed-amount airdrop) allocation) })
		)
    
		;; Transfer tokens (this would call the token contract's transfer function)
		;; For demonstration, we return success
		(ok allocation)
	)
)

(define-public (pause-contract)
	(begin
		(asserts! (is-contract-owner) err-owner-only)
		(var-set paused true)
		(ok true)
	)
)

(define-public (unpause-contract)
	(begin
		(asserts! (is-contract-owner) err-owner-only)
		(var-set paused false)
		(ok true)
	)
)

(define-public (deactivate-airdrop (airdrop-id uint))
	(let
		(
			(airdrop (unwrap! (map-get? airdrops airdrop-id) err-airdrop-not-found))
		)
		(asserts! (is-contract-owner) err-owner-only)
    
		(map-set airdrops airdrop-id
			(merge airdrop { active: false })
		)
		(ok true)
	)
)

(define-public (activate-airdrop (airdrop-id uint))
	(let
		(
			(airdrop (unwrap! (map-get? airdrops airdrop-id) err-airdrop-not-found))
		)
		(asserts! (is-contract-owner) err-owner-only)
    
		(map-set airdrops airdrop-id
			(merge airdrop { active: true })
		)
		(ok true)
	)
)
