;; SIP-010 Fungible Token - Airdrop Token
;; Implements the SIP-010 community-standard fungible token trait

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; Token Configuration
(define-fungible-token airdrop-token u1000000000000000) ;; 1 billion tokens with 6 decimals

;; Data Variables
(define-data-var token-name (string-ascii 32) "AirStack Token")
(define-data-var token-symbol (string-ascii 10) "AIRST")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://airstack.io/token-metadata.json"))

;; SIP-010 Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? airdrop-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance airdrop-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply airdrop-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Additional Functions

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? airdrop-token amount recipient)
  )
)

(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? airdrop-token amount tx-sender)
  )
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Initialize token by minting initial supply to contract owner
(begin
  (try! (ft-mint? airdrop-token u1000000000000000 contract-owner))
)
