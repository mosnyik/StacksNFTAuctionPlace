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
 // fetch bidder's bid
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