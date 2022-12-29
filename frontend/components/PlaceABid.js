import { AppConfig, useConnect, UserSession } from "@stacks/connect-react";
import {
    uintCV,
    AnchorMode,
    makeStandardSTXPostCondition,
    FungibleConditionCode,
    standardPrincipalCV,
    callReadOnlyFunction,
} from "@stacks/transactions";
import { useCallback, useEffect, useState } from "react";
import { userSession } from "./ConnectWallet";
import { StacksMocknet } from "@stacks/network";


const PlaceBid = () => {
    const appConfig = new AppConfig(['publish_data'])
    const userSession = new UserSession({ appConfig})
    const {doContractCall} = useConnect();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), [])

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

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        // add some code 
        const functionArgs = [
            uintCV(tokenId), 
            uintCV(bidAmount * 1000000), 
            uintCV(auctionId),
        ]

        // post condition variables
        const postConditionAddress = userSession.loadUserData().profile.stxAddress.testnet;
        const postConditionCode = FungibleConditionCode.LessEqual;
        const postConditionAmount = bidAmount * 1000000;
        
        // post condition
        const postConditions = [
            makeStandardSTXPostCondition(
                postConditionAddress,
                postConditionCode,
                postConditionAmount,
            )
        ]

        const options = {
            network,
            anchorMode: AnchorMode.Any,
            contractAddress : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            contractName: "auction",
            fuctionName: "place-a-bid",
            functionArgs,
            postConditions,
            // appDetails: {
            //     name: "Auction",
            //     icon: window.location.origin + "/vercel.svg",
            // },
            onFinish: (data) => {  
                console.log("Stacks Transaction:", data.stacksTransaction);
                console.log("Transaction ID:", data.txId);
                console.log("Raw transaction:", data.txRaw);
            },
            oncancel: () => {
                console,log("onCancel:", "Transaction was canceled");
            },

        }
        await doContractCall(options)
    }

    const nowPlaceABid = useCallback( async () => {
        if(userSession.isUserSignedIn()){
            const userAddress = userSession.loadUserData().profile.stxAddress.testnet
            const options = {
                contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
                contractName: "auction",
                functionName: "place-a-bid",
                network,
                functionArgs,
                sendAddress: userAddress
            };

            const result = await callReadOnlyFunction(options);
            console.log(result);
            // if(result.value){
            //     setHasPosted(true)
            //     setPost(result.value.data)
            // }
        }
    })

    if(!mounted || !userSession.isUserSignedIn()){
        return null
    }
    return ( 
        <div>
            <form onSubmit={handlePlaceBid} className='lg:w-1/3 sm:w-2/3 '>
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
                    {/* <button type='button' className='bg-gray-100 px-6 py-2 rounded-full border border-gray-600 hover:border-gray-100 hover:bg-gray-500 hover:text-gray-100 mx-16 '>
                    Withdraw Bid
                    </button>  */}
                </div>  
            </form>
        </div>
     );
}
 
export default PlaceBid;
