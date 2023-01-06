# **Creating an NFT Auction Dapp With Clarity and Stacks.js: Step-by-Step Guide**

In this tutorial, we would be learning how to work with Clarity to write smart contracts on the Stacks blockchain and connect it to a next.js app using Stacks.js and we want to achieve that using an NFT Auction dapp as a sample project. You can check out the [github repo](https://github.com/mosnyik/StacksNFTAuctionPlace) anytime if you want to compare your code along the way.


## **Assumption**
Since this is not a 101 beginner guide, it is assumed that you already successfully installed Clarinet on your machine and that it is available in your system PATH (that is to say, typing clarinet in your Terminal runs Clarinet), if you have not, you can get helpful guide from [Hiro's website](https://docs.hiro.so/smart-contracts/clarinet#installing-clarinet). 

## **Overview**
Auctions have a long-standing history spanning back to centuries. It is interesting to see how this method of fundraising has evolved over the years. Today, bidding is one of the fastest-growing use cases on the blockchain. All the credits go to decentralized NFT marketplaces that allow buyers and sellers to engage in a peer-to-peer model. That is why in this tutorial, we will build an NFT Auction Dapp which we would call *NFT Auction* and it will have the following features
* A user can whitelist their NFT and create an auction for it.
* Once an auction is started, the auction maker (maker) can not withdraw their NFT.
* Every auction will take an expiry time in `block height` which would correspond to the time the auction will end or expire
* The maker will only get paid in STX
* The bidder can only place a bid if they bid higher than the existing highest bid
* If a bidder did not win the bid, they can request a refund on the bid amount
* Once a bidder places a bid, they can not withdraw their bid until the auction ends
 * Once the bid ends, the winner can claim their NFT and the maker their STX
## **Workflow**
Our project would have a **backend** and a **frontend**. 

The **backend** would hold all our smart contracts and everything associated with it, and the **frontend** would hold everything that the user would use to interact with the smart contract. 

## **Backend**
To create an **auction**, the maker would call the `create-auction` function from the  auction contract with the following arguments
- The contract of the NFT to be listed
- The block height when the auction expires
- The start price for the auction
- and token id of the NFT

Once the call is made, the NFT is transferred into the contract which serves as an escrow and is kept there till the winner of the bid emerges. 
Once an auction is started, it would not be stopped halfway.

To **place-a-bid**, the bidder would call the `place-a-bid` function from the  auction contract with the following arguments
- The contract of the NFT they want to bid for
- The auction id of the auction
- The amount of STX they are biding
- and token id of the NFT

A bidder can bid for an NFT they like. Once a bid is placed, the STX is transferred into the contract, which serves as our escrow. If the bidder wins, they can claim the NFT at the expiry of the bid period. A bidder can withdraw their bid if at the expiry of the bid period they do not win the bid but they can not change their mind halfway through the bid and take their bid from the contract.

### **Setup**
To start, let's head over to our terminal window and type in this command
```bash
clarinet new NFTAuction
```
The above line would create a clarity project folder for us and some other important folders we would need for the project.

Let's now create a contract called auction by running the following commands in our terminal window
```bash
cd NFTAuction
mkdir backend
cd backend

clarinet contract new auction
```
This creates an auction.clar file in the contract folder. If we go into our `NFTAuction/backend/contracts` we would see


![](https://i.imgur.com/IqsyMOa.png)

### **NFT Contract**
Our auction dapp is for NFTs, so for the purpose of this tutorial, we will create a simple NFT implementing the [sip009 trait](https://book.clarity-lang.org/ch10-01-sip009-nft-standard.html). [Traits](https://book.clarity-lang.org/ch09-00-traits.html) are similar to token standards if you are coming from Ethereum, they are just a set of publicly defined functions that are used to define input types, output types and names. 

### IMPLEMENTING SIP009 TRAIT
To create an NFT implementing the sip009 trait, we would create a new contract and call it `sip009`. Point your terminal to the NFTAuction directory and run the command to create a contract again
```bash
clarinet contract new sip009
```
Yes, you are right! This would add the sip009.clar file to the contract folder. Next, we would import the trait that we are implementing.  

```bash
clarinet requirements add SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait

```
The command line above adds `[[project.requirements]]
contract_id = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait'` to our Clarinet.toml file which allows us to tap into the `sip009-traits`.

With that done, let us start building 🛠

At the top of your file, let us [assert conformity](https://book.clarity-lang.org/ch09-02-implementing-traits.html#asserting-trait-conformance) with our sip009 trait which simply means we implementing the specifications of the sip009 contract - that is the functions defined in the trait.
On the topmost of our contract, we would add the line 
```Clarity
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-constant contract-owner tx-sender)
```
The first line indicates that we are implementing sip009-nft trait. 
The next line sets the contract owner to be the one who deploys the contract. That means whoever mints the NFT becomes the owner of the NFT, which makes sense right?, yes that is the security built into Clarity.

Let us define errors for the contract, put these lines next, they simply set error to err codes
```Clarity
(define-constant err-only-owner (err u100))
(define-constant err-token-id-failure (err u101))
(define-constant err-not-token-owner (err u102))
```
To create our NFT, we would use 

```Clarity
(define-non-fungible-token auctionnfts uint)

(define-data-var token-id-nonce uint u0)
```
The line creates an NFT collection with the name `auctionnfts`.

The next line defines a variable `token-id-nonce` of type uint starting with the value of 0 (Note it is written as u0 because it is an unsigned integer) that sets a unique id for each NFT minted.

To implement the NFT trait, what we need to do is simply define all the required functions defined in the [official deployed contract](https://explorer.stacks.co/txid/0x80eb693e5e2a9928094792080b7f6d69d66ea9cc881bc465e8d9c5c621bd4d07?chain=mainnet), so we would start with the `get-last-token-id`.

```Clarity
(define-read-only (get-last-token-id) 
    (ok (var-get token-id-nonce) )
)
```
The line above defines a read-only function, which is a function that does not modify the state of the blockchain, (so it only reads from the blockchain) called `get-last-token-id` and returns the `token id` as an okay response.

```Clarity
(define-read-only (get-token-uri (token-id uint)) 
    (ok none)
)
```
Next, we define another read-only function to get `token-uri`. The function takes in a token-id as a parameter and returns the token-uri.

```Clarity
(define-read-only (get-owner (token-id uint)) 
    (ok (nft-get-owner? auctionnfts token-id))
)
```
After that we define yet another read-only function to check for the owner of the token, it is the token-id and returns the principal that owns the token

```Clarity
(define-public (transfer (token-id uint ) (sender principal) (reciever principal)) 
    (begin 
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
            ;; #[filter(token-id, reciever)]
        (nft-transfer? auctionnfts token-id sender reciever)
    )
)
)
```
Now let's define a transfer function. It would be a public function meaning it can be called from outside the contract by maybe an app or another contract, it would take the reciever's principal, the sender's principal and the token-id and the body of the function to perform a couple of checks, 
the first check is to ensure that the sender is the owner of the token, if true, then the second line transfers the token from the sender to the reciever.


```Clarity
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
```

Finally, we would define a mint function which is also a public function that allows for external calls. The function takes the reciever's principal - that is the principal that is calling the mint function.
Once the call is made, first, the function sets the token id to be the last token id + 1 then, It would now check to ensure that the principal calling the contract is the reciever of the token that would be minted
After that, the next line, try to mint the token, if the token-id already exists, the operation fails and every state mutation gets reverted, otherwise, the last line runs and sets the token-nonce which is the specific identifier given to the token when created to be the value of the token-id and then returns the token id of the minted token.

By now your `sip009.clar` file should look like this

```Clarity
(define-non-fungible-token auctionnfts uint)

(define-data-var token-id-nonce uint u0)
```
```Clarity
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
```

### **The Auction Contract**
Our auction contract, at its most basic, is an escrow that takes an NFT when an auction is created. We would be using the NFT we just created for testing later.


Now let's start working on the NFTAuction.
Let's go to our `auction.clar` that we created earlier when we started and import traits we would be needing and define our constants.

In our terminal window, we would run 

```bash
clarinet requirements add SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait
```
which would import the trait requirements for using SIP009 and add 
`
[[project.requirements]]
contract_id = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait'
`
to our Clarinet.toml file.
Next, we would define constants for our project.
Let's start with,

```Clarity!

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
 (define-constant err-bid-winner-cannot-withdraw (err u4001))
 ```


The NFTAuction place would have to store some data about the auctions created, for example, *every auction created should have a unique id, tracked by an unsigned integer (uint) that increaments for each auction created and never re-used.* This would be stored in a map

This is what our set up would look like 

```Clarity!

;; auction
;; <add a description here>

;; use the nft-trait imported for use in the dapp
(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; set the address of the contract deployer to be the contract-owner
(define-constant contract-owner tx-sender)

;; auction-creation errors
(define-constant err-expiry-not-set (err u1000))
(define-constant err-start-price-not-set (err u1001))
(define-constant err-asset-contract-not-whitelisted (err u1002))
(define-constant err-invalid-auction (err u1003))
(define-constant err-unauthorized (err u1004))

;; biding errors
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

;; map for auctions - basically the details of an auction
;; 'auctions' maps a uint(auction-id) to a tuple of 
;; - the auction maker
;; - token-id of the NFT placed on auction
;; - the assets-contract-principal
;; - the expiry block height
;; - the start-price for the auction
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
;; maps a principal to the total amount that principal have bided
(define-map bids principal {
    bider: principal,
    biders-total-bid: uint,
})

;; get a bider bid using the principal
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
;; if an asset is whitelised, it returns true,
;; and false otherwise
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
        (ok (map-set whitelisted-assets-contract asset-contract whitelisted))
    )
)

;; helper function to transfer nft
(define-private (transfer-nft (token-contract <nft-trait>) (token-id uint) (sender principal) (reciever principal)) 
    (contract-call? token-contract transfer token-id sender reciever)
)

;; private functions
;;

;; public functions
;;

```
Before any auction can be created, the NFT contract MUST be whitelisted first. Then and only then would the `create-auction` call run without error.

*Starting an auction* 


```Clarity!

;; function for creating an auction

;; create-auction, take variables:-
;; - nft-trait
;; - token-id
;; - expiry
;; - start-price
(define-public (create-auction (nft-asset-contract <nft-trait>) (nft-asset { token-id: uint, expiry: uint, start-price: uint, })) 
    (let (
            ;; take auction-nonce and call it auction-id 
            ;; and use it in the within the `create-auction`
            ;; code block 
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
         ;; set highest-bid to start-price specified by the maker
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

;; can be used to fetch auction from the auction map using auction-id
(define-read-only (get-auction (auction-id uint)) 
    (map-get? auctions auction-id)
)
```

We have successfully created `create-auction` feature for our dapp, you can test it if you want by heading over to your terminal pointing to  `NFTAuction/backend` and typing the following

```bash
clarinet console
```
deploy our contract locally and spin up a bunch of test account with 100M STX for testing, NOTE: the first account would be the deployer account. 



below the array of accounts, type to mint and auctionnft
```bash
(contract-call? .sip009 mint tx-sender)
```
This would call the mint function from the sip009 contract that we deployed and mint it to the caller of the contract you would get a response 
```bash
Events emitted
{"type":"nft_mint_event","nft_mint_event":{"asset_identifier":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009::auctionnfts","recipient":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","value":"u1"}}
(ok u1)
``` 
to indicate that the call was successfull.

Now you can make the run the command 

```bash
(contract-call? .auction set-whitelisted .sip009 true)
```
You would get a response 
`(ok "NFT whitelisted successfully")` to indicate that the call was successfull.

Then create-auction

```bash
(contract-call? .auction create-auction .sip009 {token-id: u1, expiry: u10, start-price: u1000})
```
You would get a response 
```bash
Events emitted
{"type":"nft_transfer_event","nft_transfer_event":{"asset_identifier":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009::auctionnfts","sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","recipient":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction","value":"u1"}}
(ok u0)
```
 to indicate that the call was successfull.

*Placing a bid*

To place a bid, the bidder would need to call the `place-a-bid` function and pass in the following parameters:-
* bid amount
* token id 
* NFT contract identifier
* and auction id

```Clarity!

(define-public (place-a-bid (nft-asset-contract <nft-trait>) (bid-details {token-id: uint, bid-amount: uint, auction-id: uint}) ) 
    (let (
            ;; use the auction-id passed when making the call to 
            ;; create a tuple called `auction` to be used
            ;; throughout the place-a-bid fuction
            (auction (unwrap! (map-get? auctions (get auction-id bid-details)) err-invalid-auction) )
             ;; use the bid-id passed when making the call to 
            ;; set a new bid-id that would become the bid-id 
            ;; of this very bid
            (bid-id (+ (var-get bid-nonce) u1)) 
            ;; fetch the highest bid in the auction and name it 
            ;; highest-bid
            (highest-bid (var-get  highest-bid-amount))  
        ) 
        
        ;; check if maker is the one biding
        ;; remeber we said the maker can not bid with thesame 
        ;; principal they used to create the auction
        (asserts! (not (is-eq tx-sender (get maker auction))) err-maker-taker-equal)
        ;; check if the NFT is actually put on auction/whitelisted
        (asserts! (is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)
        ;; check if the bid duration has expired
        (asserts! (> (get expiry auction) block-height) err-already-expired)
        ;; make sure that bid-amount > hgiest-bid
        (asserts! (> (get bid-amount bid-details) highest-bid ) err-bid-amount-too-low)
       ;; check if the STX transfered > highest-bid-amount
       (try! (stx-transfer? (get bid-amount bid-details) tx-sender (as-contract tx-sender)) )
       ;; set highest-bid-amount to bid-amount
       (var-set highest-bid-amount (get bid-amount bid-details))
       ;; set highest-bider to tx-sender
       (var-set highest-bider tx-sender)
       ;; update the total bids
       (var-set total-bids (+ (get bid-amount bid-details) (var-get total-bids)) )
        ;; update the bids map with the caller's bid-amount
        ;; using thier principal as the key
        (map-set bids tx-sender  { bider: tx-sender, biders-total-bid: (get bid-amount bid-details)} )
       ;; return the auction id
        (ok tx-sender)
    ) 

```

we can test to see if our `place-a-bid` fuction is also fuctioning properly, below the `create-auction` call that we made, we would run the following command. Note that we said the maker can not use the same principal to `place-a-bid` so let's first switch our 'tx-sender' by running 

```bash
::set_tx_sender ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
```
You would get a response `tx-sender switched to ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC` to indicate that the call was successfull.

```bash
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction place-a-bid 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009 {token-id: u1, auction-id: u0, bid-amount: u2000})
```

Be very mindful of the `'` before the principal, that is how we indicate a standard principal. Also notice that the 'bid-amount' is greater that the 'start-price', IT MUST HAVE TO BE, otherwise it would return an error, because we specified that the 'bid-amount' must be more than the present highest-bid and we set the 'start-price' to be the 'highest-bid' when we first created the auction. Finaly, note that when calling a contract function from the principal which deployed it, you need not write the identifier in full, hence we used '.auction' in our `create-auction` call but when we call `place-a-bid`  using another principal, we would need to make it complete so we use `'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction` and `'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009`

You would get a response 
```bash
Events emitted
{"type":"stx_transfer_event","stx_transfer_event":{"sender":"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC","recipient":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction","amount":"2000","memo":""}}
(ok ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
``` 
to indicate that the call was successfull.

Repeat the process for two or three more principal so you can have a couple of bids to try with when you want to 'settle-auction' and 'request-refund'

*Bid fulfilment*

Once the bid time is up, the highest bider can claim their NFT by providing 
* the contract identifier of the NFT they won
* the auction id of the auction the NFT was listed in

```Clarity

(define-public  (settle-auction (nft-asset-contract <nft-trait>) (auction-id uint)  )
    (let 
        (
            ;; use the auction-id passed when making the call to 
            ;; create a tuple called `auction` to be used
            ;; throughout the settle-auction fuction
            (auction (unwrap! (map-get? auctions auction-id ) err-invalid-auction))
            ;; use the tx-sender making the call to 
            ;; create a tuple called `bid` that taps into the 'bids' map
            ;; which would be used throughout the settle-auction fuction
            (bid (unwrap! (map-get? bids tx-sender) err-invalid-bider))
            ;; set the tx-sender to be called 'taker' throughout 
            ;; the settle-auction fuction 
            ;; (taker tx-sender)
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
```
You can test your `settle-auction` feature by running some terminal commands like we have done in the previous tests

```terminal
::get_assets_maps
```
this would give us a view of the assets and their owners distributed in our local deployment. From here, we can see the principals that bid for the auction as well as who has the NFT right now

Before we run settle-auction, we need to make sure that the contract has expired, in our local deployment, the block-hieght does not increase, so we would need to move it manually, sur the code 
```terminal
::advance_chain_tip 10
```
to move the block-height to 11, If you did not run the above command, you would get an error return (err u3002). Then run the command.

```terminal
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction settle-auction 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009 u0)
```
You would get a response 
```terminal
Events emitted
{"type":"nft_transfer_event","nft_transfer_event":{"asset_identifier":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009::auctionnfts","sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction","recipient":"ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB","value":"u1"}}
{"type":"stx_transfer_event","stx_transfer_event":{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction","recipient":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","amount":"3500","memo":""}}
(ok ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB)
```
to indicate that the call was successfull.

If we run now

```terminal
::get_assets_maps
```
we would see that the amount of STX that was in the contract is less by the 'highest-bid-amount' now and the NFT has been transfered to the corresponding 'highest-bider', all that is left is the total sum of STX of the other biders who did not win

*Request Refund* 

If by the end of the auction duration, a bider does not win the bid, they can 'request-refund' on their bid amount by providing 
* the contract identifier of the NFT they placed a bid on
* the auction id of the auction the NFT was listed in

```clarity
;; If a bidder did not win the bid, they can request a refund on the bid amount

(define-public (request-refund (nft-asset-contract <nft-trait>) (auction-id uint)) 
 
    (let
        (
            ;; use the tx-sender making the call to 
            ;; create a tuple called `bid` that taps into the 'bids' map
            ;; which would be used throughout the request-refund fuction
            (bid (unwrap! (map-get? bids tx-sender ) err-invalid-bider))
            ;; use the auction-id passed when making the call to 
            ;; create a tuple called `auction` to be used
            ;; throughout the request-refund fuction
            (auction (unwrap! (map-get? auctions auction-id ) err-invalid-auction))
            ;; set the tx-sender to be called 'taker' throughout 
            ;; the request-refund fuction 
            (taker tx-sender)
        ) 
        ;; check that block-height > expiry
        (asserts! (> block-height (get expiry auction)) err-expiry-not-reached-yet)
        ;; check that the caller is not the bid-winner 
        ;; that is total-bid-amount < highest-bid amount
        (asserts! (< (get biders-total-bid bid) (var-get highest-bid-amount)) err-bid-winner-cannot-take-refund)
        ;; transfer the biders amount back to them
        (try! (as-contract (stx-transfer? (get biders-total-bid bid) tx-sender taker)))
        (ok true)
    )
)
```

```terminal
::set_tx_sender <any-other-bider-other-than-the-bid-winner>
```
Switch principal to any other principal that placed a bid but was not the winner

```terminal
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction request-refund 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009 u0)
```

You would get a response 
```
Events emitted
{"type":"stx_transfer_event","stx_transfer_event":{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction","recipient":"ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND","amount":"3000","memo":""}} 
(ok "STX refunded")
```
 to indicate that the call was successfull.

if we do a `::get_assets_maps` now, we would see that the STX sum in the contract is less by the callers bid and the callers bid has been refunded.

Congratulations, you have sucessfully created the NFTAuction place smart contract using CLarity and clarinet.

Next we would work on the frontend of the dapp

## **FRONTEND**

Now that we are done with the smart contract, we would hook it to a [next.js](https://nextjs.org/docs) frontend using  [Stacks.js](https://www.hiro.so/stacks-js) which is a full fledged js library for dapps on stacks blockchain. 

To build our frontend and test it, we would require a couple of things

#### **Requirements**
You would need to have `npm` running on you machine, I am using `v 9.1.3` if you are not sure what you are using, run 

```
npm -v
```
outside your clarinet console to see your `npm` version.

You would be using *Docker* to run a local devnet on your machine, you can install one [here](https://www.docker.com/) if you do not already have.

Since this is not a react-next or tailwind tutorial, we would just supply a boiler plate code for the next app and focus more on the stack.js side of things.


Back to our `NFTAuction` create a folder called `frontend` using the code. ( Assuming you have been following from the begining non stop, otherwise just point terminal to your project root directory )
```shell
cd ../

mkdir frontend

cd frontend
```

in the frontend folder, run

```
npm create-next-app@latest
```
to create a next app for you and in the same folder. Your folder structure at this point should look like this
```shell
NFTAuctionDapp
    -backend
    -frontend
```
 Now run

```shell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

The first line would install tailwindcss, postcss and autoprefixer as dev dependency in our frontend folder, the second line would create a tailwind.config.js file where we can configure our tailwindcss for the app.
Now let's go in to the tailwind.config.js and add some codes to content as follows to allow tailwind to access our pages and components(which we would create in a sec) folders

```shell
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```
And now lets add tailwind to our global styles so that we can see and use it from anywhere within the app, let's go to global.css in our styles folder under the frontend folder and paste the following lines, replacing all that is there

```shell
@tailwind base;
@tailwind components;
@tailwind utilities;
```

with this, we are all set to build our frontend of the dapp. 

*PAGES*

Now you can replace the code in your *index.js* file with 

***Index.js page***

```javascript
import NavBar from '../components/NavBar'
import MintNFT from '../components/MintSIP009';


export default function Home() {
  return (
    <div>
      <NavBar />
      <div>
        <h2 className='font-bold py-8 px-4 text-2xl'>
          The NFT Place
        </h2>
        <p className='px-4 text-lg '>
          Welcome to the NFT Auction Place,
          you are welcome to create an Auction or place a bid
          just go ahead and connect your wallet and you are all set to roll
        </p>
        <h2 className='font-bold py-4 px-4 text-2xl'>
        Mint a token and try the platform
        </h2>
        
      </div >
      <div className = ' px-4 '>
      < MintNFT />
      </div>
   
    </div>
  )
}
```
What is going on in this index.js file? Nothing gang-aang at all (It means nothing serious at all)
Just a regular component that retuns some texts to welcome our user and a MintNFT component to allow user mint a sample auctionnft that they can use to test the platform.

***auction.js page***

```javascript

import NavBar from '../components/NavBar'
import { Connect, } from "@stacks/connect-react";
import {
    AppConfig,
    UserSession,
} from "@stacks/connect";


import WhitelistNFT from '../components/Whitelist';
import CreateAuction from '../components/CreateAuction';

export default function Home() {
  const appConfig = new AppConfig(["publish_data"]);
  const userSession = new UserSession({ appConfig });

  const authOption = {
            appDetails: {
              name: 'auction',
              icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
            },
            redirectTo: '/',
            userSession: userSession,
          }

  return (
    <div>
      <NavBar />
      <div className='py-16 '>
            <div>
                <h2 className='px-4 pb-6 font-bold text-xl'>
                    Create an Auction, it is our pleasure to allow you liquidate your NFT
                </h2>
                <p className='px-4 pb-4'>
                    All you need to do is first whitelist your NFT, 
                    Then you can put it on auction!!
                </p>
            </div>
            {/*
            implimentation of whitelist
             */}
            <Connect authOptions={authOption}>
            < WhitelistNFT />
            </Connect>

        <div>
                <h2 className='px-4 pb-6 font-bold text-xl'>
                    You can now put your NFT on auction!!
                </h2>
                <p className='px-4 pb-4'>
                    Provide the NFT identifier, its token id, an auction starting price 
                    and then set a duration for your auction. 
                    
                </p>
            </div>
        {/*
            implimentation of create auction
             */}
            <Connect authOptions={authOption}>
            < CreateAuction />
            </Connect>
        
      </div>
    </div>
  )
}

```


***bid.js page***

This would be the bids page

```javascript
import NavBar from '../components/NavBar'
import {
    AppConfig,
    UserSession,
} from "@stacks/connect";

import { useState, useEffect } from 'react';
import PlaceBid from '../components/PlaceABid';
import { Connect, } from "@stacks/connect-react";

export default function Home() {
    const appConfig = new AppConfig(["publish_data"]);
    const userSession = new UserSession({ appConfig });
    
    const [userData, setUserData] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);

    const authOption = {
        appDetails: {
          name: 'auction',
          icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
        },
        redirectTo: '/',
        userSession: userSession,
      }

    useEffect(() => {
        if (userSession.isSignInPending()) {
          userSession.handlePendingSignIn().then((userData) => {
            setUserData(userData)
          })
        } else if (userSession.isUserSignedIn()) {
          setLoggedIn(true)
          setUserData(userSession.loadUserData())
        }
      }, [])

  return (
    <div>
      <NavBar />
      <div className='py-16 '>
            <div>
                <h2 className='px-4 pb-6 font-bold text-xl'>
                    Place a bid, the highest bidder gets the NFT
                </h2>
                <p className='px-4 pb-4'>
                    Note: Once you place a bid, you can not widraw until the auction is over. <br/>
                    However you can request a refund if you did not win the bid
                </p>
            </div>

             {/*
            implimentation of whitelist
             */}
            <Connect authOptions={authOption}>
            < PlaceBid />
            </Connect>

      </div>
    </div>
  )
}
```

Now let's create a components folder inside our fronend folder inside which we would create
*NavBar.js* and paste the following codes.

If you try running 
```shell
npm run dev
```
it would yell at you about the components not created, so we would create the components.

Note: If you run `npm run dev` later and you see get an error about not being able to find the `regenerator-runtime` package, run` npm i regenerator-runtime` and it should be fixed.

***NavBar.js component***

```javascript
import Link from 'next/link'
import ConnectWallet from './ConnectWallet'

const NavBar = () => {
    return ( 

        (<div className= 'p-10 flex flex-nowrap space-x-4 drop-shadow-lg bg-slate-100 h-10 justify-around ' >
            <div>NFT Auction Place</div>
            <div className='px-10 flex flex-row justify-around space-x-6'>  
                <div className='hover:underline '>
                    <Link href = {'/'}>
                        Home
                    </Link>
                </div>
                <div className='hover:underline '>
                    <Link href = {'/auction'}>
                        Create Auction
                    </Link>
                </div>
                <div className='hover:underline '>
                    <Link href = {'/bid'}>
                        Bid
                    </Link>
                </div>
            </div>
            <div>
                <ConnectWallet />
            </div>
        </div>)
         
     );
     
}
 
export default NavBar;
```
Here also nothing gang-aang is happening ( which means nothing serious is happening), it is just a regular component that retuns some clickable texts in the navbar and a button that allows user connect and move around the platform easily.

***ConnectWallet.js component*** 

```javascript
import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["publish_data"]);

export const userSession = new UserSession({ appConfig });

// function for authenticating user
function authenticate() {
  showConnect({
    appDetails: {
      name: "NFT Auction Place",
      icon: window.location.origin + "/logo512.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

// function to diconnect wallet
function disconnect() {
  userSession.signUserOut("/");
}
// function for connecting wallet
const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
      <div>
        <button className=" 
        bg-white 
        hover:bg-gray-100 
        px-4 
        py-1 
        border 
        border-gray-600 
        text-gray-400  
        hover:text-gray-800 
        shadow 
        justify-start 
        mb-4 
        rounded-full" 
        onClick={disconnect}>
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <button className=" bg-white hover:bg-gray-100 px-4 py-1 border border-gray-600 text-gray-400  hover:text-gray-800 shadow justify-start mb-4 rounded-full" onClick={authenticate}>
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;
```
What is going on in the *connectWallet* component? Well, it is basically just authenticating the user using `@stacks/connect`. If the user is not logged in, they get a pop up to log into their web wallet or downlaod one, if logged in, they also have a chance to disconnect if they so choose. 

***MintSIP009.js component***

```javascript
import { AppConfig, UserSession } from '@stacks/connect';
import { StacksMocknet } from '@stacks/network';
import {
    NonFungibleConditionCode,
    createAssetInfo,
    makeStandardNonFungiblePostCondition,
    bufferCVFromString,
    standardPrincipalCV
} from '@stacks/transactions'
import {openContractCall} from '@stacks/connect'

const MintNFT = () => {
    
    const appConfig = new AppConfig(['publish_data'])
    const userSession = new UserSession({ appConfig})
    // setting our network to StackMocknet
    const network = new StacksMocknet()

    // our mint function that gets called when the button is press
    const mint = async () => {
        /*
        Remember when we were testing our smart contract, we had to mint an NFT first before we do anything else, that is what this component help us do, mint the NFT.
        The asset address is the contract deployer's address
        */
        const assetAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
        
        // when we minted the NFT, we minted it to tx-sender, which is the caller of the contract, here we are specifying that the NFT be minted to the user calling the contract
        const functionArgs = [
            standardPrincipalCV(
                userSession.loadUserData().profile.stxAddress.testnet
            ),
        ]

        // this is a set of parameters clarity needs to construct an openContractCall
        const options = {
            contractAddress: assetAddress,
            contractName: 'sip009',
            functionName: 'mint',
            functionArgs,
            network,
            appDetails: {
                name: 'sip009',
                icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
            },
            onFinish: (data) => {
                // a very simple way to provide feedback to users that the NFT has been minted successfully
                window.alert("NFT mint successful, you can whitelist the NFT now, then create an auction");
                console.log("Stacks Transaction:", data.stacksTransaction);
                console.log("Transaction ID:", data.txId);
                console.log("Raw transaction:", data.txRaw);
            },
        }
        await openContractCall(options)
    }
    return ( 
        <div>
            <button 
            type='submit' onClick={mint}
            className='bg-gray-100 
            px-6 
            py-2 
            rounded-full 
            border 
            border-gray-600 
            hover:border-gray-100 
            hover:bg-gray-500 
            hover:text-gray-100 
            font-semibold'>
                 Mint NFT
            </button>
        </div>
     );
}
 
export default MintNFT;
```
Here too, not so much is going on, you know we defined about four fuctions in the `sip009.clar` when we wrote our smart contract, well we are only interested in the mint function, and that is what we hooked up to.

***WhitelistNFT.js component***

```javascript
import React, { useEffect, useState } from "react";
import {  useConnect } from "@stacks/connect-react";
import {  StacksMocknet } from "@stacks/network";
import {
  AnchorMode,
   PostConditionMode,
  NonFungibleConditionCode,
  bufferCVFromString,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  contractPrincipalCV,
  StacksMessageType, 
  trueCV,  
} from "@stacks/transactions";

import { userSession } from "./ConnectWallet";

const WhitelistNFT = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [assetWhitelist, setAssetWhitelist] = useState("");
  const handleAssetWhitelistChange = (e) => {
    setAssetWhitelist(e.target.value);
  };

const network = new StacksMocknet();

const setWhitelistNFT = async (e) => {
    e.preventDefault();
    const address = assetWhitelist

    // post condition values
    const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'  
    const assetAddress = address
    const postConditionCode = NonFungibleConditionCode.DoesNotSend;
    const assetContractName = "sip009"
    const assetName = 'auctionnfts'
    const tokenAssetName = bufferCVFromString('auctionnfts')
    const type = StacksMessageType.AssetInfo
    const nonFungibleAssetInfo = createAssetInfo (
        assetAddress,
        assetContractName,
        assetName,
        type
        )
    /*
    Remember when we made contract-calls from clarinet console,
    we did it in the format 
    (contract-call? contract-we-are-calling-from function-we-are-call function-arguments)
    */
    const functionArgs = [ 
        /*
        Note that we need to construct a contractPrincipal CLarity Type 
        because the principal we parse is the NFT contract
        */
          contractPrincipalCV(
            address,
            assetContractName
            ),
        trueCV(),
        ];
       
    // postconditions
    const postConditions = [
        makeStandardNonFungiblePostCondition(
            postConditionAddress,
            postConditionCode,
            nonFungibleAssetInfo,
            tokenAssetName
            ),
                            ];
    // object used as argument to parse into a contract call
    const options = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "auction",
        functionName: "set-whitelisted",
        functionArgs,
        PostConditionMode: PostConditionMode.Deny,
        postConditions,
        appDetails: {
            name: "Auction",
            icon: window.location.origin + "/vercel.svg",
        },
        onFinish: (data) => {
          window.alert("Contract Whitelisted, now you can create an auction after a block confirmation");
            console.log("Stacks Transaction:", data.stacksTransaction);
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
        },
    }
   
     await doContractCall(options);
   
}

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (

    <div>

    <form onSubmit={setWhitelistNFT} className='lg:w-1/3 sm:w-2/3 '>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Asset id  
                    </div>
                    <input 
                    type="text" 
                    value={assetWhitelist} 
                    id='whiteListAssetId' 
                    onChange={handleAssetWhitelistChange} 
                    placeholder="eg ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"  
                    className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>
                 <div className='px-5 py-4 '>
                    <button 
                    type='submit' 
                    className='bg-gray-100 px-6 py-2 rounded-full border border-gray-600 hover:border-gray-100 hover:bg-gray-500 hover:text-gray-100 font-semibold'>
                        Whitelist NFT
                    </button>
                </div>
            </form>
    </div>
  );
};

export default WhitelistNFT;
```
All we are doing here is to make a contract call to the smart contract with the required arguements converted to clarity types.

***CreateAuction.js component***

```javascript
import React, { useEffect, useState } from "react";
import { useConnect, } from "@stacks/connect-react";
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  NonFungibleConditionCode,
  bufferCVFromString,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  contractPrincipalCV,
  StacksMessageType,
  tupleCV
} from "@stacks/transactions";
import { userSession } from "./ConnectWallet";
import { StacksMocknet } from "@stacks/network";

const CreateAuction = () => {
  /**
   * NOTE: this is an NFT transfer event,
   * we are sendeing the NFT fro the maker to the contract
   * sender: standardPrincipal
   * reciever: contractPrincipal
   * postConditions: standardNonFunginbleTransfer for contractPrincipal
   */
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

    const [assetId, setAssetId] = useState("")
    const [startPrice, setStartPrice] = useState(0)
    const [tokenId, setTokenId] = useState(0)
    const [auctionDuration, setAuctionDuration] = useState(0)

    const network = new StacksMocknet();

    const handleAssetIdChange = (e) => {
        setAssetId(e.target.value);
      };

    const handlePriceChange = (e) => {
        setStartPrice(e.target.value);
      };

    const handleTokenIdChange = (e) => {
        setTokenId(e.target.value);
      };

    const handleAuctionDurationChange = (e) => {
        setAuctionDuration(e.target.value);
      };

  const createAuction= async (event) => {
    event.preventDefault();

    // constructing values for postconditions
    const address = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  
    const assetAddress = address
    const postConditionAddress = 
        userSession.loadUserData().profile.stxAddress.testnet
    const nftPostConditionCode = NonFungibleConditionCode.Sends;
    const assetContractName = 'sip009'
    const assetName = 'auctionnfts'
    const tokenAssetName = bufferCVFromString('auctionnfts')
    const type = StacksMessageType.AssetInfo
    const nonFungibleAssetInfo = createAssetInfo(
            assetAddress,
            assetContractName,
            assetName,
            type
    )
   

    const functionArgs = [ 
      
      contractPrincipalCV(
          address,
          assetContractName
          ),
      tupleCV({
        "token-id": uintCV(tokenId), 
        "start-price": uintCV(startPrice * 1000000), 
        "expiry": uintCV(auctionDuration),})
  ];
  
  /*
  Post conditions are clarity built-in checker that
help mitigate the potential risk of having a reentrancy 
call by ensuring that certain conditions are met otherwise, 
the fuction call reverts and the caller lose just
 the transaction fees alone
  */
    const postConditions = [
        makeStandardNonFungiblePostCondition(
            postConditionAddress,
            nftPostConditionCode,
            nonFungibleAssetInfo,
            tokenAssetName
            ),
        
    ]
    
    const options = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      contractName: "auction",
      functionName: "create-auction",
      functionArgs,
       PostConditionMode: PostConditionMode.Deny,
       postConditions,
      appDetails: {
          name: "Auction",
          icon: window.location.origin + "/vercel.svg",
      },
      onFininsh: (data) => {
          window.alert("Auction create successfully");
          console.log("Stacks Transaction:", data.stacksTransaction);
          console.log("Transaction ID:", data.txId);
          console.log("Raw transaction:", data.txRaw);
      }
  }
    await doContractCall(options);
  };

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (
    <div>
        <form onSubmit={createAuction} className='lg:w-1/3 sm:w-2/3 '>
            <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                    Asset id  
                </div>
                <input type="text" value={assetId} id='assetId' onChange={handleAssetIdChange} placeholder="eg ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"  className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
            </div>
            
            <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                    Start Price  
                </div>
                <input 
                type="number" 
                value={startPrice} 
                id='startPrice' 
                onChange={handlePriceChange}  
                placeholder='Enter auction start price eg 5000 STX' 
                className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
            </div>
            <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                <div  className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                    Token ID  
                </div>
                <input 
                value={tokenId} 
                id='tokenId' 
                type='number' 
                onChange={handleTokenIdChange} 
                placeholder='Enter the token ID' 
                className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
            </div>  
            <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                <div className='flex-shrink-0 bg-gray-600  text-gray-100 text-sm py-2 px-6'>
                    Set Duration  
                </div>
                <input 
                value={auctionDuration} 
                id='auctionDuration' 
                type='number' 
                onChange={handleAuctionDurationChange} 
                placeholder='Enter the block-heigh at which the auction ends' 
                className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
            </div> 
            <div className='px-5 py-4 '>
            <button 
            type='submit' 
            className='bg-gray-100 px-6 py-2 rounded-full border border-gray-600 hover:border-gray-100 hover:bg-gray-500 hover:text-gray-100 font-semibold'>
                 Start Auction
            </button>
            </div>
        </form>
    </div>
  );
};

export default CreateAuction;

```
This component basically just exports a button that when clicked calls the `create-auction` function from the our smart contract and transfers the NFT from the caller to the contract.

***PlaceBid.js component***

```javascript
import { AppConfig, useConnect, UserSession } from "@stacks/connect-react";
import {
    FungibleConditionCode,
    makeStandardSTXPostCondition,
    uintCV,
    AnchorMode,
    PostConditionMode,
    contractPrincipalCV,
    tupleCV,

} from "@stacks/transactions";
import {useEffect, useState } from "react";

import { StacksMocknet } from "@stacks/network";


const PlaceBid = () => {
      /**
   * NOTE: this is an STX transfer event,
   * we are sendeing the STX from the bider to the contract
   * sender: standardPrincipal
   * reciever: contractPrincipal
   * postConditions: standardPrincipalSTXtransfer for contractPrincipal
   */
    const appConfig = new AppConfig(['publish_data'])
    const userSession = new UserSession({ appConfig})
    const {doContractCall} = useConnect();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), [])

    const [assetId, setAssetId] = useState("")
    const [bidAmount, setBidAmount] = useState(0);
    const [tokenId, setTokeenId] = useState(0);
    const [auctionId, setAuctionId] = useState(0);
    const handleBidAmountChange = (e) => {
        setBidAmount(e.target.value)
    }

    const network = new StacksMocknet();
    const handleTokenIdChange = (e) => {
        setTokeenId(e.target.value)
    }

    const handleAuctionIdChange = (e) =>{
        setAuctionId(e.target.value)
    }

    const handleAssetIdChange = (e) =>{
        setAssetId(e.target.value)
    }

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        const address = assetId
        
        // postcondition variables
        const postConditionAddress = 
        userSession.loadUserData().profile.stxAddress.testnet
        const stxConditionCode = FungibleConditionCode.LessEqual;
        const assetContractName = 'sip009'
        /*
        usually in clarity, STX amounts are in microStacks by default
        so we convert them to STX by multiplying the amount by 1000000.
        Our biding is in STX not microStacks
        */
        const stxConditionAmount = bidAmount * 1000000
         
        const functionArgs = [
            contractPrincipalCV(
                address,
                assetContractName
                ),
            tupleCV({
                "token-id": uintCV(tokenId), 
                "bid-amount": uintCV(bidAmount * 1000000), 
                "auction-id": uintCV(auctionId),})
        ]

        // postcondition
        const postConditions = [

        makeStandardSTXPostCondition(
            postConditionAddress,
            stxConditionCode,
            stxConditionAmount
            )]

        const options = {
            network,
            anchorMode: AnchorMode.Any,
            contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            contractName: "auction",
            functionName: "place-a-bid",
            functionArgs,
            PostConditionMode: PostConditionMode.Deny,
            postConditions,
            appDetails: {
                name: "Auction",
                icon: window.location.origin + "/vercel.svg",
            },
            onFininsh: (data) => {
                window.alert("Bid placed successfully");
                console.log("Stacks Transaction:", data.stacksTransaction);
                console.log("Transaction ID:", data.txId);
                console.log("Raw transaction:", data.txRaw);
            }
        }
       await doContractCall(options);
    }

    if(!mounted || !userSession.isUserSignedIn()){
        return null
    }
    return ( 
        <div>
            <form onSubmit={handlePlaceBid} className='lg:w-1/3 sm:w-2/3 '>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Asset id  
                    </div>
                    <input type="text" value={assetId} id='assetId' onChange={handleAssetIdChange} placeholder="eg ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"  className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div  className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Bid Amount
                    </div>
                    <input onChange={handleBidAmountChange} type='number' value={bidAmount} placeholder='Bids are in STX eg 4 means 4 STX' className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>  
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div  className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Token-id  
                    </div>
                    <input onChange={handleTokenIdChange} type='number' value={tokenId} placeholder='Enter token id of your bid interest' className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>  
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div  className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Auction-id  
                    </div>
                    <input onChange={handleAuctionIdChange} type='number' value={auctionId} placeholder='Enter the auction id of the bid' className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>
                <div className='px-5 py-4 justify-evenly'>
                    <button type='submit' className='bg-gray-100 px-6 py-2 rounded-full border border-gray-600 hover:border-gray-100 hover:bg-gray-500 hover:text-gray-100 '>
                    Place Bid
                    </button>
                </div>  
            </form>
        </div>
     );
}
 
export default PlaceBid;

```


So when a user places a bid, they transfer their bid amount to the contract as well, so essentially, they make an STX transfer to the contract

Finally, we said if the user won the bid, they can claim their win by providing some details, likewise, if they did not win, they can request refund on their bid amount.

***SettleAuction.js & RequestRefund.js component***

```javascript

import React, { useCallback,useEffect, useState } from "react";
import {  useConnect } from "@stacks/connect-react";
import {  StacksMocknet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  NonFungibleConditionCode,
  FungibleConditionCode,
  bufferCVFromString,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  standardPrincipalCV,
  contractPrincipalCV,
  StacksMessageType, 
  uintCV,
  callReadOnlyFunction  
} from "@stacks/transactions";

import { userSession } from "./ConnectWallet";
// run npm i @use-it/interval
import useInterval from "@use-it/interval";

const SettleAuction = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [assetId, setAssetId] = useState("");
  const [auctionId, setAuctionId] = useState(0);
  const [bidersBid, setBidersBid] = useState(0);
  const [highestBidAmount, setHighestBidAmount] = useState(0);
  const handleAuctionIdChange = (e) =>{
    setAuctionId(e.target.value)
}
  const handleAssetIdChange = (e) => {
    setAssetId(e.target.value);
  };

const network = new StacksMocknet();
// function to request refund
const handleRequestRefund = async (e) =>{
    e.preventDefault();
    const address = assetId

    // post condition values
    const postConditionAddress = 
    userSession.loadUserData().profile.stxAddress.testnet
    const stxConditionCode = FungibleConditionCode.LessEqual
    const assetContractName = 'sip009'
    const stxConditionAmount = bidersBid
    const functionArgs = [ 
        contractPrincipalCV(
            address,
            assetContractName
            ),
        uintCV(auctionId),
        ];
       
    // postconditions
    const postConditions = [

        makeStandardSTXPostCondition(
            postConditionAddress,
            stxConditionCode,
            stxConditionAmount
            )]
    
    const options = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "auction",
        functionName: "request-refund",
        functionArgs,
        PostConditionMode: PostConditionMode.Deny,
        postConditions,
        appDetails: {
            name: "Auction",
            icon: window.location.origin + "/vercel.svg",
        },
        onFinish: (data) => {
          window.alert("Refund request successful, wait for block confirmation to get your refund");
            console.log("Stacks Transaction:", data.stacksTransaction);
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
        },
    }
   
     await doContractCall(options);

}
 // fetch bidder's bid
 const getBidersBid = useCallback(async () => {

  if (userSession.isUserSignedIn()) {
    const userAddress = userSession.loadUserData().profile.stxAddress.testnet
    const callOptions = {
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "auction",
        functionName: "get-biders-total-bid",
        network: new StacksMocknet(),
        functionArgs: [standardPrincipalCV(
          userAddress
        )],
       
    };

    const result = await callReadOnlyFunction(callOptions);
    console.log(result);
    if (result.value) {
      setBidersBid(result.value)
    }
  }
});
// fetch Bider's Bid every second
useInterval(getBidersBid, 10000);

// function to claim win
const handleClaimWin = async (e) => {
    e.preventDefault();
    const address = assetId

    // post condition values
    const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'  
    const assetAddress = address
    const postConditionCode = NonFungibleConditionCode.Sends;
    const assetContractName = "sip009"
    const assetName = 'auctionnfts'
    const tokenAssetName = bufferCVFromString('auctionnfts')
    const type = StacksMessageType.AssetInfo
    const nonFungibleAssetInfo = createAssetInfo (
        assetAddress,
        assetContractName,
        assetName,
        type
        )
    const stxConditionCode = FungibleConditionCode.LessEqual;
    const stxConditionAmount = highestBidAmount;

    const functionArgs = [ 
        contractPrincipalCV(
            address,
            assetContractName
            ),
        uintCV(auctionId),
        ];
       
    // postconditions
    const postConditions = [
        makeStandardNonFungiblePostCondition(
            postConditionAddress,
            postConditionCode,
            nonFungibleAssetInfo,
            tokenAssetName
            ),
            makeStandardSTXPostCondition(
                postConditionAddress,
                stxConditionCode,
                stxConditionAmount
                )
                            ];
    
    const options = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "auction",
        functionName: "settle-auction",
        functionArgs,
        PostConditionMode: PostConditionMode.Deny,
        postConditions,
        appDetails: {
            name: "Auction",
            icon: window.location.origin + "/vercel.svg",
        },
        onFinish: (data) => {
          window.alert("Win claim successful, wait for block confirmation to get your claim");
            console.log("Stacks Transaction:", data.stacksTransaction);
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
        },
    }
   
     await doContractCall(options);
   
}

 // fetch bider's bid
 const getHeighestBidAmount = useCallback(async () => {

  if (userSession.isUserSignedIn()) {
    const userAddress = userSession.loadUserData().profile.stxAddress.testnet
    const callOptions = {
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "auction",
        functionName: "get-highest-bid-amount",
        network: new StacksMocknet(),
        functionArgs: [standardPrincipalCV(
          userAddress
        )],
       
    };

    const result = await callReadOnlyFunction(callOptions);
    console.log(result);
    if (result.value) {
      setBidersBid(result.value)
    }
  }
});
// fetch Heighest Bid Amount every second
useInterval(getHeighestBidAmount, 10000);

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (

    <div>

    <form  className='lg:w-1/3 sm:w-2/3 '>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Asset id  
                    </div>
                    <input 
                    type="text" 
                    value={assetId} 
                    id='whiteListAssetId' 
                    onChange={handleAssetIdChange} 
                    placeholder="eg ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"  
                    className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div  className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Auction-id  
                    </div>
                    <input onChange={handleAuctionIdChange} type='number' value={auctionId} placeholder='Enter the auction id of the bid' className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
                </div>
            </form>
            <div className='px-5 py-4 '>
                    <button 
                    onClick={handleClaimWin}
                    type='button' 
                    className='
                    bg-gray-100 
                    px-6 
                    py-2 
                    rounded-full 
                    border 
                    border-gray-600 
                    hover:border-gray-100 
                    hover:bg-gray-500 
                    hover:text-gray-100 
                    font-semibold
                    mr-8'>
                        Claim Win
                    </button>
                    <button 
                    onClick={handleRequestRefund}
                    type='button' 
                    className='
                    bg-gray-100 
                    px-6 
                    py-2 
                    rounded-full 
                    border 
                    border-gray-600 
                    hover:border-gray-100 
                    hover:bg-gray-500 
                    hover:text-gray-100 
                    font-semibold
                    ml-8'>
                        Request Refund
                    </button>
                </div>
                
    </div>
  );
};

export default SettleAuction;
```
This is quite a lengthy one but what is going in is simple. We are exporting a component called SettleAuction, which has a couple of fuctions. The first function is the `handleRequestRefund`, it takes the asset identifier and auction id as inputs and requests a refund using the callers address to check for the callers bid amount. the `handleClaimWin` function takes the same functions and transfers the NFT from the contract to the bid winner and the highest bid amount to the maker.


Congratulations, you have created a full stack dapp for an NFT Auction place, this by no means is an implemetation that would be suitable for an enterprise solution. It is intended to serve as a mere example for illustrating how to use Clarity to create smart contract and stack.js to hook the smart contract to a frontend. If you found value, you can follow me on social @mosnyik. 
Thank you for your time.