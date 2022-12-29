import React, { useEffect, useState } from "react";
import { useConnect, Connect } from "@stacks/connect-react";
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  NonFungibleConditionCode,
  bufferCVFromString,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
} from "@stacks/transactions";
import {
    AppConfig,
    UserSession,
    showConnect,
    openContractCall,
  } from '@stacks/connect'
import { userSession } from "./ConnectWallet";
import { StacksMocknet } from "@stacks/network";

const CreateAuction = () => {
  const { doContractCall } = useConnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

    const [assetId, setAssetId] = useState("")
    const [startPrice, setStartPrice] = useState(0)
    const [tokenId, setTokenId] = useState(0)
    const [auctionDuration, setAuctionDuration] = useState(0)
    const [auctionContractAddress, setAuctionContractAddress] = useState(
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );

    const network = new StacksMocknet();

    const handleAssetidChange = (e) => {
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
    const functionArgs = [ 
        stringUtf8CV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'), 
        uintCV(tokenId), 
        uintCV(startPrice * 1000000), 
        uintCV(auctionDuration),
    ];

    const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    const nftPostConditionCode = NonFungibleConditionCode.DoesNotSend;
    const assetContractName = 'sip009'
    const assetName = 'sip009'
    const assetAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const tokenAssetName = bufferCVFromString('sip009')
    const nonFungibleAssetInfo = createAssetInfo(
            assetAddress,
            assetContractName,
            assetName
    )

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
        contractAddress: auctionContractAddress ,
        contractName: "auction",
        functionName: "create-auction",
        functionArgs,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        
        appDetails: {
            name: "Auction",
            icon: window.location.origin + "/vercel.svg",
        },
        onFinish: (data) => {
            // console.log(data)
            console.log("Stacks Transaction:", data.stacksTransaction);
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
        },
    }
   const tx = await doContractCall(options);
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
                <input type="text" value={assetId} id='assetId' onChange={handleAssetidChange} placeholder="eg 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009"  className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
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
