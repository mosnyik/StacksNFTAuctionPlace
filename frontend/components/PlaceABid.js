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
        const stxConditionAmount = bidAmount * 1000000
        
        // add some code 
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
