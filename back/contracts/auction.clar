;; auction
;; An NFT Auction place that allows users to create auction for their NFTs, which would be paid in STX they specify:-
;; - The token to sell
;; - Auction expiry in block height
;; - Set the start-price 

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-constant contract-owner tx-sender)

;; auction-creation errors
(define-constant err-expiry-not-set (err u1000))
(define-constant err-start-price-not-set (err u1001))
(define-constant err-asset-contract-not-whitelisted (err u1002))
(define-constant err-invalid-auction (err u1003))
(define-constant err-unauthorized (err u1004))

;; bidding errors
(define-constant err-token-invalid (err u2000))
(define-constant err-bid-amount-too-low (err u2001))
(define-constant err-maker-taker-equal (err u2002))
(define-constant err-already-expired (err u2003))
(define-constant err-invalid-price (err u2004))
(define-constant err-no-such-bid (err u2005))

 ;; settlement error
 (define-constant err-invalid-settlement (err u3001))
 (define-constant err-expiry-not-reached-yet (err u3002))
 (define-constant err-invalid-bider (err u3003))
 (define-constant err-not-bid-winner (err u3004))

 ;; withdrawer error
 (define-constant err-bid-winner-cannot-take-refund (err u4001))

;; map for auctions
(define-map auctions 
    uint {
        maker: principal,
        token-id: uint,
        nft-asset-contract: principal,
        expiry: uint,
        start-price: uint,
    } 
)

;; count to identify auction
(define-data-var auction-nonce uint u0)


;; map for bids
(define-map bids principal {
    bider: principal,
    biders-total-bid: uint,
})

(define-read-only (get-bid (who principal)) 
    (map-get? bids who)
)

;; count to identify bids
(define-data-var bid-nonce uint u0)

;; variable to track highest-bid-amount
(define-data-var highest-bid-amount uint u250 )

;; variable to hold the highest-bider principal
(define-data-var highest-bider principal contract-owner )

;; variable to hold a bider's total bid
(define-data-var biders-total-bid uint u0)

;; keep tract of all bids
(define-data-var total-bids uint u0)

;; fetch the total bid value
(define-read-only (get-total-bids) 
(var-get total-bids)
)

(define-read-only (get-biders-total-bid) 
(var-get biders-total-bid)
)

;; get the highest-bid-amount
(define-read-only (get-highest-bid-amount) 
    (var-get highest-bid-amount)
)

;; get the highest-bider principal
(define-read-only (get-highest-bider) 
    (var-get highest-bider)
)


;; map of whitelisted assets to their principals
(define-map whitelisted-assets-contract principal bool)



;; fetch whitelisted asset-contract from the whitelisted-contract-asset map 
(define-read-only (is-whitelisted (asset-contract principal)) 
    (default-to false (map-get? whitelisted-assets-contract asset-contract) )

)

;; update the whitelisted-contract-asset map
(define-public (set-whitelisted (asset-contract principal) (whitelisted bool)) 
    (begin 
        (asserts! (is-eq contract-owner tx-sender ) err-unauthorized)
          ;; #[filter(asset-contract)]
          (map-set whitelisted-assets-contract asset-contract whitelisted)
        (ok "NFT whitelisted successfully")
    )
)

;; helper function to transfer nft
(define-private (transfer-nft (token-contract <nft-trait>) (token-id uint) (sender principal) (reciever principal)) 
    (contract-call? token-contract transfer token-id sender reciever)
)

;; function for creating an auction

;; create-auction, take variables:-
;; - nft-trait
;; - token-id
;; - expiry
;; - start-price
(define-public (create-auction (nft-asset-contract <nft-trait>) (nft-asset { token-id: uint, expiry: uint, start-price: uint, })) 
    (let (
            (auction-id (var-get auction-nonce))
         ) 
         ;; check if NFT is whitelisted
         (asserts! (is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)
         ;; check if the duration has expired
         (asserts! (> (get expiry nft-asset) block-height ) err-expiry-not-set)
         ;; check if the start price for the auction is set
         (asserts! (> (get start-price nft-asset) u0) err-start-price-not-set)
          ;; transfer NFT to the contract           
         (try! (transfer-nft nft-asset-contract (get token-id nft-asset) tx-sender (as-contract tx-sender)) )
         ;; set highest-bid to start-price
         (var-set highest-bid-amount (get start-price nft-asset) )
         ;; update the total bids vriable
         (var-set total-bids (+ (get start-price nft-asset) (var-get total-bids)) )
        ;; add auction to the auctions map
         (map-set auctions auction-id (merge {maker: tx-sender, nft-asset-contract: (contract-of nft-asset-contract)} nft-asset) )
         ;; increament the auction identifier
         (var-set auction-nonce (+ auction-id u1))
         ;; return the auction id
         (ok auction-id)
    )
)

;; fetch auction-id from the auction map
(define-read-only (get-auction (auction-id uint)) 
    (map-get? auctions auction-id)
)


(define-public (place-a-bid (nft-asset-contract <nft-trait>) (bid-details {token-id: uint, bid-amount: uint, auction-id: uint}) ) 
    (let (
            (auction (unwrap! (map-get? auctions (get auction-id bid-details)) err-invalid-auction) )
            (bid-id (+ (var-get bid-nonce) u1)) (highest-bid (var-get  highest-bid-amount)) 
            
        ) 
        
        ;; check if contract owner is the one bidding
        (asserts! (not (is-eq tx-sender (get maker auction))) err-maker-taker-equal)
        ;; check if the NFT is actually put on auction/whitelisted
        (asserts! (is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)
        ;; check if the bid duration has expired
        (asserts! (> (get expiry auction) block-height) err-already-expired)
        ;; assert that bid-amount > hgiest-bid
        (asserts! (> (get bid-amount bid-details) highest-bid ) err-bid-amount-too-low)
       ;; check if the STX transfered > highest-bid-amount
       (try! (stx-transfer? (get bid-amount bid-details) tx-sender (as-contract tx-sender)) )
       ;; set highest-bid-amount to sent amount
       (var-set highest-bid-amount (get bid-amount bid-details))
       ;; set highest-bider to tx-sender
       (var-set highest-bider tx-sender)
       ;; update the total bids
       (var-set total-bids (+ (get bid-amount bid-details) (var-get total-bids)) )
       ;; update the bids map with the caller's bid-amount using thier principal as the key
       (map-set bids tx-sender  { bider: tx-sender, biders-total-bid: (get bid-amount bid-details)} )
       ;; return the auction id
        (ok tx-sender)
    ) 
)


(define-public  (settle-auction (nft-asset-contract <nft-trait>) (auction-id uint)  )
    (let 
        (
            (auction (unwrap! (map-get? auctions auction-id ) err-invalid-auction))
            (bid (unwrap! (map-get? bids tx-sender) err-invalid-bider))
            ;;(taker tx-sender)
        ) 

         ;; check if aucton have expired
         (asserts! (> block-height (get expiry auction)) err-expiry-not-reached-yet)
         ;; check if the caller is the bid winner
         (asserts! (is-eq (get biders-total-bid bid) (var-get highest-bid-amount)) err-not-bid-winner)
         ;; send NFT from contract to highest bider
         ;; #[filter(nft-asset-contract)]
         (try! (as-contract (transfer-nft nft-asset-contract (get token-id auction) tx-sender (var-get highest-bider) ) ))
         ;; send STX from contract to the maker
         (try! (as-contract (stx-transfer? (var-get highest-bid-amount) tx-sender (get maker auction))))
        
         (ok tx-sender)
    )
)

;; If a bidder did not win the bid, they can request a refund on the bid amount

(define-public (request-refund (nft-asset-contract <nft-trait>) (auction-id uint)) 
 
    (let
        (
            (bid (unwrap! (map-get? bids tx-sender ) err-invalid-bider))
            (auction (unwrap! (map-get? auctions auction-id ) err-invalid-auction))
            (taker tx-sender)
        ) 
        ;; block-height > expiry
        (asserts! (> block-height (get expiry auction)) err-expiry-not-reached-yet)
        ;; total-bid-amount < highest-bid amount
        (asserts! (< (get biders-total-bid bid) (var-get highest-bid-amount)) err-bid-winner-cannot-take-refund)
        ;; transfer the biders amount back to the
        (try! (as-contract (stx-transfer? (get biders-total-bid bid) tx-sender taker)))
        
        (ok "STX refunded")
    )
)

  ;; #[filter(nft-asset-contract)]

;; Major Functions
;; private function - get-bid-winner - get the highest bider //
;; private fuction - get-highest-bid-amount - get the highest biders amount //
;; private function - set-end-time - set auction end time 
;; public funtion - place-a-bid - to place a bid 
;; public function - Create-auction - to create auction 
;; public funcion - withdraw-bid - request withdrawer 