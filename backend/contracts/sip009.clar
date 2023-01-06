
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-constant contract-owner tx-sender)

;; NFT errors
(define-constant err-only-owner (err u100))
(define-constant err-token-id-failure (err u101))
(define-constant err-not-token-owner (err u102))

;; create the NFT collection
(define-non-fungible-token auctionnfts uint)
(define-data-var token-id-nonce uint u0)

;; function to get the last token id
(define-read-only (get-last-token-id) 
    (ok (var-get token-id-nonce) )
)

;; function to get token URI
(define-read-only (get-token-uri (token-id uint)) 
    (ok none)
)

;; function to fetch owner of the NFT
(define-read-only (get-owner (token-id uint)) 
    (ok (nft-get-owner? auctionnfts token-id))
)

;; function for NFT transfer
(define-public (transfer (token-id uint ) (sender principal) (reciever principal)) 
    (begin 
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
            ;; #[filter(token-id, reciever)]
        (nft-transfer? auctionnfts token-id sender reciever)
    )
)

;; funton to mint NFT
(define-public (mint ( reciever principal)) 
    (let 
        (
            (token-id (+ (var-get token-id-nonce) u1 ) )
        ) 
        (asserts! (is-eq tx-sender reciever) err-not-token-owner)
        (try! (nft-mint? auctionnfts token-id reciever))
		(asserts! (var-set token-id-nonce token-id) err-token-id-failure)
		(ok token-id)
    )
)
