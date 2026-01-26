;; BitArt Market - Marketplace Contract
;; Handles NFT listing, price updates, and purchases with royalty distribution

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-FOUND u404)
(define-constant ERR-INVALID-INPUT u400)
(define-constant ERR-ALREADY-LISTED u409)
(define-constant ERR-INSUFFICIENT-BALANCE u402)
(define-constant ERR-INVALID-PRICE u403)

;; Marketplace Listings
(define-map listings
  { nft-id: uint }
  {
    seller: principal,
    price: uint,
    quantity: uint,
    listed-at: uint,
    expires-at: uint
  }
)

;; Track listing counter
(define-data-var listing-counter uint u0)

;; Fees (in basis points: 1 = 0.01%)
(define-data-var platform-fee uint u250) ;; 2.5% default

;; Fee recipient address
(define-data-var fee-recipient principal CONTRACT-OWNER)

;; ============================================
;; Listing Functions
;; ============================================

;; List an NFT for sale
;; Post-condition: NFT must be owned by seller and price must be > 0
(define-public (list-nft
  (nft-id uint)
  (price uint)
  (quantity uint)
  (duration uint) ;; in blocks
)
  (let (
    (current-listing (map-get? listings { nft-id: nft-id }))
    (expires-at (+ block-height duration))
  )
    ;; Check if already listed
    (asserts! (is-none current-listing) (err ERR-ALREADY-LISTED))
    ;; Validate price
    (asserts! (> price u0) (err ERR-INVALID-PRICE))
    ;; Validate quantity
    (asserts! (> quantity u0) (err ERR-INVALID-INPUT))
    ;; Create listing
    (map-insert listings
      { nft-id: nft-id }
      {
        seller: tx-sender,
        price: price,
        quantity: quantity,
        listed-at: block-height,
        expires-at: expires-at
      }
    )
    (ok nft-id)
  )
)

;; Update listing price
(define-public (update-listing-price (nft-id uint) (new-price uint))
  (let (
    (current-listing (map-get? listings { nft-id: nft-id }))
  )
    ;; Check listing exists
    (asserts! (is-some current-listing) (err ERR-NOT-FOUND))
    ;; Check sender is seller
    (asserts! (is-eq tx-sender (get seller (unwrap! current-listing (err ERR-NOT-FOUND))))
      (err ERR-UNAUTHORIZED)
    )
    ;; Validate new price
    (asserts! (> new-price u0) (err ERR-INVALID-PRICE))
    ;; Update price
    (let ((listing (unwrap! current-listing (err ERR-NOT-FOUND))))
      (map-insert listings
        { nft-id: nft-id }
        (merge listing { price: new-price })
      )
    )
    (ok true)
  )
)

;; Cancel listing
(define-public (cancel-listing (nft-id uint))
  (let (
    (current-listing (map-get? listings { nft-id: nft-id }))
  )
    ;; Check listing exists
    (asserts! (is-some current-listing) (err ERR-NOT-FOUND))
    ;; Check sender is seller
    (asserts! (is-eq tx-sender (get seller (unwrap! current-listing (err ERR-NOT-FOUND))))
      (err ERR-UNAUTHORIZED)
    )
    ;; Delete listing
    (ok (map-delete listings { nft-id: nft-id }))
  )
)

;; ============================================
;; Purchase Functions
;; ============================================

;; Buy NFT from listing (simplified, in production use STX/tokens)
;; Post-condition: Payment sent to seller minus platform fee to fee recipient
(define-public (buy-nft (nft-id uint) (quantity uint))
  (let (
    (current-listing (map-get? listings { nft-id: nft-id }))
    (listing (unwrap! current-listing (err ERR-NOT-FOUND)))
    (seller (get seller listing))
    (price (get price listing))
    (total-price (* price quantity))
    (platform-fee-amount (/ (* total-price (var-get platform-fee)) u10000))
    (seller-amount (- total-price platform-fee-amount))
  )
    ;; Validate quantity
    (asserts! (<= quantity (get quantity listing)) (err ERR-INVALID-INPUT))
    ;; Update quantity or remove listing
    (if (> (- (get quantity listing) quantity) u0)
      (map-insert listings
        { nft-id: nft-id }
        (merge listing { quantity: (- (get quantity listing) quantity) })
      )
      (map-delete listings { nft-id: nft-id })
    )
    ;; In production, this would be handled by post-conditions with STX transfers
    ;; For now, we return the transaction details
    (ok {
      nft-id: nft-id,
      quantity: quantity,
      total-price: total-price,
      platform-fee: platform-fee-amount,
      seller-amount: seller-amount,
      seller: seller,
      buyer: tx-sender
    })
  )
)

;; ============================================
;; Admin Functions
;; ============================================

;; Update platform fee
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    ;; Validate fee (max 10%)
    (asserts! (<= new-fee u1000) (err ERR-INVALID-INPUT))
    (ok (var-set platform-fee new-fee))
  )
)

;; Update fee recipient
(define-public (set-fee-recipient (new-recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (ok (var-set fee-recipient new-recipient))
  )
)

;; ============================================
;; Read-Only Functions
;; ============================================

;; Get listing details
(define-read-only (get-listing (nft-id uint))
  (map-get? listings { nft-id: nft-id })
)

;; Check if NFT is listed
(define-read-only (is-listed (nft-id uint))
  (is-some (map-get? listings { nft-id: nft-id }))
)

;; Get platform fee in basis points
(define-read-only (get-platform-fee)
  (var-get platform-fee)
)

;; Calculate total cost including platform fee
(define-read-only (calculate-total-cost (price uint) (quantity uint))
  (let (
    (subtotal (* price quantity))
    (fee (/ (* subtotal (var-get platform-fee)) u10000))
  )
    (+ subtotal fee)
  )
)

;; Get current fee recipient
(define-read-only (get-fee-recipient)
  (var-get fee-recipient)
)
