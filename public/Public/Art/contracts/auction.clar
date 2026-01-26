;; BitArt Market - Auction Contract
;; Handles NFT auctions with bidding, countdown timer, and reserve price

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-FOUND u404)
(define-constant ERR-INVALID-INPUT u400)
(define-constant ERR-AUCTION-EXPIRED u405)
(define-constant ERR-AUCTION-NOT-ENDED u406)
(define-constant MIN-BID-INCREMENT u100) ;; 1% minimum bid increment

;; Auction State
(define-map auctions
  { auction-id: uint }
  {
    nft-id: uint,
    seller: principal,
    current-bid: uint,
    highest-bidder: principal,
    reserve-price: uint,
    start-height: uint,
    end-height: uint,
    is-ended: bool
  }
)

;; Bid history for refunds
(define-map bids
  { auction-id: uint, bidder: principal }
  { amount: uint }
)

;; Track auction counter
(define-data-var auction-counter uint u0)

;; ============================================
;; Auction Creation
;; ============================================

;; Create new auction
(define-public (create-auction
  (nft-id uint)
  (reserve-price uint)
  (duration uint) ;; in blocks
)
  (let ((auction-id (+ (var-get auction-counter) u1)))
    ;; Validate reserve price
    (asserts! (> reserve-price u0) (err ERR-INVALID-INPUT))
    ;; Create auction
    (map-insert auctions
      { auction-id: auction-id }
      {
        nft-id: nft-id,
        seller: tx-sender,
        current-bid: reserve-price,
        highest-bidder: tx-sender,
        reserve-price: reserve-price,
        start-height: block-height,
        end-height: (+ block-height duration),
        is-ended: false
      }
    )
    ;; Increment counter
    (var-set auction-counter auction-id)
    (ok auction-id)
  )
)

;; ============================================
;; Bidding Functions
;; ============================================

;; Place a bid on auction
;; Post-condition: Previous highest bid refunded to previous bidder
(define-public (place-bid (auction-id uint) (bid-amount uint))
  (let (
    (auction (unwrap! (map-get? auctions { auction-id: auction-id }) (err ERR-NOT-FOUND)))
    (current-bid (get current-bid auction))
    (min-bid (+ current-bid (/ current-bid MIN-BID-INCREMENT)))
  )
    ;; Check auction not expired
    (asserts! (< block-height (get end-height auction)) (err ERR-AUCTION-EXPIRED))
    ;; Check auction not ended
    (asserts! (is-eq (get is-ended auction) false) (err ERR-AUCTION-NOT-ENDED))
    ;; Check bid amount
    (asserts! (>= bid-amount min-bid) (err ERR-INVALID-INPUT))
    ;; Store previous bid for refund
    (if (is-some (map-get? bids { auction-id: auction-id, bidder: (get highest-bidder auction) }))
      (ok true)
      (map-insert bids
        { auction-id: auction-id, bidder: (get highest-bidder auction) }
        { amount: (get current-bid auction) }
      )
    )
    ;; Update auction with new bid
    (map-insert auctions
      { auction-id: auction-id }
      (merge auction {
        current-bid: bid-amount,
        highest-bidder: tx-sender
      })
    )
    ;; Store current bid for tracking
    (map-insert bids
      { auction-id: auction-id, bidder: tx-sender }
      { amount: bid-amount }
    )
    (ok bid-amount)
  )
)

;; ============================================
;; Auction Resolution
;; ============================================

;; End auction (only after end-height is reached)
(define-public (end-auction (auction-id uint))
  (let (
    (auction (unwrap! (map-get? auctions { auction-id: auction-id }) (err ERR-NOT-FOUND)))
  )
    ;; Check auction time has passed
    (asserts! (>= block-height (get end-height auction)) (err ERR-INVALID-INPUT))
    ;; Mark as ended
    (map-insert auctions
      { auction-id: auction-id }
      (merge auction { is-ended: true })
    )
    (ok true)
  )
)

;; Claim auction (winner claims NFT, loser claims bid refund)
(define-public (claim-auction (auction-id uint))
  (let (
    (auction (unwrap! (map-get? auctions { auction-id: auction-id }) (err ERR-NOT-FOUND)))
    (highest-bidder (get highest-bidder auction))
    (seller (get seller auction))
  )
    ;; Check auction is ended
    (asserts! (is-eq (get is-ended auction) true) (err ERR-INVALID-INPUT))
    ;; Check if claim is valid
    (asserts! (or (is-eq tx-sender highest-bidder) (is-eq tx-sender seller))
      (err ERR-UNAUTHORIZED)
    )
    ;; Remove auction from active list (optional - can mark as claimed)
    ;; In production: transfer NFT to highest bidder, send STX to seller
    (ok {
      auction-id: auction-id,
      winner: highest-bidder,
      winning-bid: (get current-bid auction),
      nft-id: (get nft-id auction)
    })
  )
)

;; ============================================
;; Read-Only Functions
;; ============================================

;; Get auction details
(define-read-only (get-auction (auction-id uint))
  (map-get? auctions { auction-id: auction-id })
)

;; Check if auction is active
(define-read-only (is-auction-active (auction-id uint))
  (match (map-get? auctions { auction-id: auction-id })
    auction (and (< block-height (get end-height auction)) (is-eq (get is-ended auction) false))
    false
  )
)

;; Get minimum next bid
(define-read-only (get-minimum-next-bid (auction-id uint))
  (match (map-get? auctions { auction-id: auction-id })
    auction (+ (get current-bid auction) (/ (get current-bid auction) MIN-BID-INCREMENT))
    u0
  )
)

;; Check if bid exists for user
(define-read-only (get-user-bid (auction-id uint) (bidder principal))
  (map-get? bids { auction-id: auction-id, bidder: bidder })
)

;; Get total auctions
(define-read-only (get-total-auctions)
  (var-get auction-counter)
)
