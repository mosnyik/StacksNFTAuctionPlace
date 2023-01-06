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
    const functionArgs = [ 
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

  