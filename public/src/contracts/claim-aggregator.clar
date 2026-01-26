;; Claim Aggregator Contract
;; Production-grade contract for claiming tokens from multiple airdrop campaigns in a single transaction
;; Supports merkle-proof verification, double-claim prevention, and campaign validity checks

;; Constants
(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-owner-only (err u200))
(define-constant err-aggregator-paused (err u201))
(define-constant err-invalid-claim-data (err u202))
(define-constant err-merkle-verification-failed (err u203))
(define-constant err-already-claimed (err u204))
(define-constant err-campaign-not-active (err u205))
(define-constant err-campaign-not-found (err u206))
(define-constant err-transfer-failed (err u207))
(define-constant err-too-many-claims (err u208))
(define-constant err-invalid-amount (err u209))
(define-constant err-block-height-invalid (err u210))

;; Maximum claims per transaction to prevent unbounded loops
(define-constant max-claims-per-batch u20)

;; Data Variables
(define-data-var aggregator-paused bool false)
(define-data-var total-claims-processed uint u0)
(define-data-var total-tokens-distributed uint u0)

;; Contract references (these should be set by owner)
(define-data-var airdrop-manager-contract principal tx-sender)
(define-data-var merkle-tree-contract principal tx-sender)
(define-data-var token-contract principal tx-sender)

;; Data Maps
;; Track claims across all campaigns to prevent double-claiming
(define-map aggregated-claims
	{ user: principal, airdrop-id: uint, merkle-root-id: uint }
	{ 
		claimed: bool, 
		amount: uint, 
		claim-block: uint,
		claim-tx: (buff 32)
	}
)

;; Track eligible campaigns per user (set by admin/oracle)
(define-map eligible-campaigns
	principal
	(list 50 { airdrop-id: uint, merkle-root-id: uint, estimated-amount: uint })
)

;; Track batch claims for analytics
(define-map batch-claim-history
	{ user: principal, batch-block: uint }
	{
		campaigns-claimed: uint,
		total-amount: uint,
		timestamp: uint
	}
)

;; Claim data structure for batch processing
(define-public (aggregate-claim
	(claims (list 20 {
		airdrop-id: uint,
		amount: uint,
		merkle-root-id: uint,
		leaf: (buff 32),
		proof: (list 32 (buff 32))
	}))
)
	(let
		(
			(user tx-sender)
			(num-claims (len claims))
		)
		;; Validate basic constraints
		(asserts! (not (var-get aggregator-paused)) err-aggregator-paused)
		(asserts! (> num-claims u0) err-invalid-claim-data)
		(asserts! (<= num-claims max-claims-per-batch) err-too-many-claims)
		
		;; Process all claims and aggregate results
		(match (fold process-claim-fold claims (ok { total: u0, successful: u0 }))
			success-result
			(let
				(
					(total-claimed (get total success-result))
				)
				;; Record batch claim history
				(map-set batch-claim-history
					{ user: user, batch-block: block-height }
					{
						campaigns-claimed: (get successful success-result),
						total-amount: total-claimed,
						timestamp: block-height
					}
				)
				
				;; Update global stats
				(var-set total-claims-processed (+ (var-get total-claims-processed) (get successful success-result)))
				(var-set total-tokens-distributed (+ (var-get total-tokens-distributed) total-claimed))
				
				;; Emit single aggregate event
				(print {
					event: "aggregate-claim-complete",
					user: user,
					campaigns-processed: num-claims,
					campaigns-successful: (get successful success-result),
					total-tokens-claimed: total-claimed,
					claim-block: block-height,
					batch-id: (unwrap-panic (get-block-info? id-header-hash block-height))
				})
				
				;; Return structured receipt
				(ok {
					user: user,
					campaigns-processed: num-claims,
					campaigns-successful: (get successful success-result),
					total-tokens-claimed: total-claimed,
					claim-block: block-height,
					batch-id: (unwrap-panic (get-block-info? id-header-hash block-height))
				})
			)
			error-response error-response
		)
	)
)

;; Private function to process each claim in the fold
(define-private (process-claim-fold
	(claim {
		airdrop-id: uint,
		amount: uint,
		merkle-root-id: uint,
		leaf: (buff 32),
		proof: (list 32 (buff 32))
	})
	(prior-result (response { total: uint, successful: uint } uint))
)
	(match prior-result
		prev-success
		(match (process-single-claim claim)
			claim-amount
			(ok {
				total: (+ (get total prev-success) claim-amount),
				successful: (+ (get successful prev-success) u1)
			})
			claim-error
			;; Continue processing even if one claim fails (skip it)
			(ok prev-success)
		)
		prev-error
		(err prev-error)
	)
)

;; Process a single claim with full validation
(define-private (process-single-claim
	(claim {
		airdrop-id: uint,
		amount: uint,
		merkle-root-id: uint,
		leaf: (buff 32),
		proof: (list 32 (buff 32))
	})
)
	(let
		(
			(user tx-sender)
			(airdrop-id (get airdrop-id claim))
			(amount (get amount claim))
			(merkle-root-id (get merkle-root-id claim))
			(leaf (get leaf claim))
			(proof (get proof claim))
			(claim-key { user: user, airdrop-id: airdrop-id, merkle-root-id: merkle-root-id })
		)
		;; Validation checks
		(asserts! (> amount u0) err-invalid-amount)
		
		;; Check if already claimed
		(asserts! (is-none (map-get? aggregated-claims claim-key)) err-already-claimed)
		
		;; Verify campaign exists and is active via airdrop-manager
		(asserts! (is-campaign-valid airdrop-id) err-campaign-not-active)
		
		;; Verify merkle proof via merkle-tree contract
		(asserts! (verify-merkle-proof merkle-root-id leaf proof) err-merkle-verification-failed)
		
		;; Mark as claimed in merkle-tree contract to prevent double-claim there
		(try! (mark-merkle-leaf-claimed merkle-root-id leaf))
		
		;; Record the claim
		(map-set aggregated-claims claim-key
			{
				claimed: true,
				amount: amount,
				claim-block: block-height,
				claim-tx: (unwrap-panic (get-block-info? id-header-hash block-height))
			}
		)
		
		;; Transfer tokens from airdrop-manager to user
		(try! (transfer-tokens user amount))
		
		;; Emit event for this specific claim
		(print {
			event: "claim-processed",
			user: user,
			airdrop-id: airdrop-id,
			merkle-root-id: merkle-root-id,
			amount: amount,
			block: block-height
		})
		
		(ok amount)
	)
)

;; Verify campaign is valid (active and within block height range)
(define-private (is-campaign-valid (airdrop-id uint))
	(match (contract-call? .airdrop-manager get-airdrop airdrop-id)
		airdrop-data
		(and
			(get active airdrop-data)
			(>= block-height (get start-block airdrop-data))
			(<= block-height (get end-block airdrop-data))
		)
		false
	)
)

;; Verify merkle proof using external merkle-tree contract
(define-private (verify-merkle-proof (root-id uint) (leaf (buff 32)) (proof (list 32 (buff 32))))
	(default-to false (contract-call? .merkle-tree verify-proof root-id leaf proof))
)

;; Mark leaf as claimed in merkle-tree contract
(define-private (mark-merkle-leaf-claimed (root-id uint) (leaf (buff 32)))
	(contract-call? .merkle-tree mark-leaf-claimed root-id leaf)
)

;; Transfer tokens using SIP-010 standard
(define-private (transfer-tokens (recipient principal) (amount uint))
	(let
		(
			(token-principal (var-get token-contract))
		)
		;; Call token contract's transfer function
		;; Assumes the claim-aggregator has been authorized/funded appropriately
		(match (contract-call? .airdrop-token transfer amount (as-contract tx-sender) recipient none)
			success (ok true)
			error err-transfer-failed
		)
	)
)

;; Read-only functions

(define-read-only (get-claim-status (user principal) (airdrop-id uint) (merkle-root-id uint))
	(map-get? aggregated-claims { user: user, airdrop-id: airdrop-id, merkle-root-id: merkle-root-id })
)

(define-read-only (get-eligible-campaigns (who principal))
	(default-to 
		(list)
		(map-get? eligible-campaigns who)
	)
)

(define-read-only (get-batch-history (user principal) (batch-block uint))
	(map-get? batch-claim-history { user: user, batch-block: batch-block })
)

(define-read-only (has-claimed (user principal) (airdrop-id uint) (merkle-root-id uint))
	(is-some (map-get? aggregated-claims { user: user, airdrop-id: airdrop-id, merkle-root-id: merkle-root-id }))
)

(define-read-only (get-total-claims-processed)
	(ok (var-get total-claims-processed))
)

(define-read-only (get-total-tokens-distributed)
	(ok (var-get total-tokens-distributed))
)

(define-read-only (is-paused)
	(ok (var-get aggregator-paused))
)

;; Admin functions

(define-public (set-airdrop-manager (new-manager principal))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set airdrop-manager-contract new-manager)
		(ok true)
	)
)

(define-public (set-merkle-tree-contract (new-contract principal))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set merkle-tree-contract new-contract)
		(ok true)
	)
)

(define-public (set-token-contract (new-token principal))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set token-contract new-token)
		(ok true)
	)
)

(define-public (pause-aggregator)
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set aggregator-paused true)
		(ok true)
	)
)

(define-public (unpause-aggregator)
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set aggregator-paused false)
		(ok true)
	)
)

;; Set eligible campaigns for a user (typically called by an oracle/admin)
(define-public (set-eligible-campaigns 
	(who principal) 
	(campaigns (list 50 { airdrop-id: uint, merkle-root-id: uint, estimated-amount: uint }))
)
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(map-set eligible-campaigns who campaigns)
		(ok true)
	)
)
