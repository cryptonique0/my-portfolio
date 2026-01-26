;; BitArt Market - NFT Contract
;; Manages NFT creation, ownership, and metadata storage with royalty support

;; Data Structures and Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-FOUND u404)
(define-constant ERR-INVALID-INPUT u400)
(define-constant ERR-ALREADY-EXISTS u409)
(define-constant ERR-INVALID-ROYALTY u402)

;; NFT Metadata Maps
(define-map nft-metadata
  { nft-id: uint }
  {
    creator: principal,
    owner: principal,
    name: (string-utf8 256),
    description: (string-utf8 1024),
    image-uri: (string-utf8 512),
    category: (string-utf8 64),
    royalty-percentage: uint,
    total-supply: uint,
    created-at: uint,
    updated-at: uint
  }
)

;; NFT balances (who owns how many)
(define-map nft-balances
  { owner: principal, nft-id: uint }
  { amount: uint }
)

;; Track total NFTs created
(define-data-var nft-counter uint u0)

;; Track admin addresses
(define-map admins
  { address: principal }
  { is-admin: bool }
)

;; Initialize contract owner as admin
(map-insert admins { address: CONTRACT-OWNER } { is-admin: true })

;; ============================================
;; Admin Functions
;; ============================================

;; Add admin (only contract owner)
(define-public (add-admin (address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (ok (map-insert admins { address: address } { is-admin: true }))
  )
)

;; Remove admin
(define-public (remove-admin (address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (ok (map-delete admins { address: address }))
  )
)

;; Check if address is admin
(define-read-only (is-admin (address principal))
  (match (map-get? admins { address: address })
    metadata (get is-admin metadata)
    false
  )
)

;; ============================================
;; NFT Creation & Management
;; ============================================

;; Mint a new NFT with metadata
;; Post-condition: nft balance should increase by amount
(define-public (mint-nft
  (name (string-utf8 256))
  (description (string-utf8 1024))
  (image-uri (string-utf8 512))
  (category (string-utf8 64))
  (royalty-percentage uint)
  (amount uint)
)
  (let ((nft-id (+ (var-get nft-counter) u1)))
    ;; Validate royalty (0-25%)
    (asserts! (<= royalty-percentage u25) (err ERR-INVALID-ROYALTY))
    ;; Validate amount
    (asserts! (> amount u0) (err ERR-INVALID-INPUT))
    ;; Store metadata
    (map-insert nft-metadata
      { nft-id: nft-id }
      {
        creator: tx-sender,
        owner: tx-sender,
        name: name,
        description: description,
        image-uri: image-uri,
        category: category,
        royalty-percentage: royalty-percentage,
        total-supply: amount,
        created-at: block-height,
        updated-at: block-height
      }
    )
    ;; Update balance
    (map-insert nft-balances
      { owner: tx-sender, nft-id: nft-id }
      { amount: amount }
    )
    ;; Increment counter
    (var-set nft-counter nft-id)
    (ok nft-id)
  )
)

;; Transfer NFT to another address
;; Post-condition: sender's balance decreases, receiver's balance increases
(define-public (transfer-nft (nft-id uint) (recipient principal) (amount uint))
  (let (
    (current-balance (get-nft-balance tx-sender nft-id))
  )
    ;; Validate NFT exists
    (asserts! (is-some (map-get? nft-metadata { nft-id: nft-id })) (err ERR-NOT-FOUND))
    ;; Validate sender has enough
    (asserts! (>= current-balance amount) (err ERR-INVALID-INPUT))
    ;; Update sender balance
    (if (> (- current-balance amount) u0)
      (map-insert nft-balances
        { owner: tx-sender, nft-id: nft-id }
        { amount: (- current-balance amount) }
      )
      (map-delete nft-balances { owner: tx-sender, nft-id: nft-id })
    )
    ;; Update recipient balance
    (let ((recipient-balance (get-nft-balance recipient nft-id)))
      (map-insert nft-balances
        { owner: recipient, nft-id: nft-id }
        { amount: (+ recipient-balance amount) }
      )
    )
    ;; Update metadata
    (match (map-get? nft-metadata { nft-id: nft-id })
      metadata (map-insert nft-metadata
        { nft-id: nft-id }
        (merge metadata {
          owner: recipient,
          updated-at: block-height
        })
      )
      false
    )
    (ok true)
  )
)

;; ============================================
;; Read-Only Functions
;; ============================================

;; Get NFT metadata
(define-read-only (get-nft-metadata (nft-id uint))
  (map-get? nft-metadata { nft-id: nft-id })
)

;; Get NFT balance for an owner
(define-read-only (get-nft-balance (owner principal) (nft-id uint))
  (match (map-get? nft-balances { owner: owner, nft-id: nft-id })
    balance (get amount balance)
    u0
  )
)

;; Get total NFT count
(define-read-only (get-total-nfts)
  (var-get nft-counter)
)

;; Get royalty percentage for NFT
(define-read-only (get-royalty (nft-id uint))
  (match (map-get? nft-metadata { nft-id: nft-id })
    metadata (some (get royalty-percentage metadata))
    none
  )
)

;; Check if address owns specific NFT
(define-read-only (owns-nft (owner principal) (nft-id uint))
  (> (get-nft-balance owner nft-id) u0)
)
