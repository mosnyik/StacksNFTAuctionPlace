import React, { useEffect, useState } from "react";
import { Connect, useConnect } from "@stacks/connect-react";
import { StacksTestnet,  StacksMocknet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  NonFungibleConditionCode,
  bufferCVFromString,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  stringUtf8CV,
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
  const [auctionContractAddress, setAuctionContractAddress] = useState(
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
);
const [auctionContractName, setAuctionContractName] = useState("auction");
const functionArgs = [ 
    stringUtf8CV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
];
const network = new StacksMocknet();



const whitelistNFT = async (e) => {
    e.preventDefault();
    const functionArgs = [ 
        stringUtf8CV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
    ];

    const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    const assetAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    const postConditionCode = NonFungibleConditionCode.DoesNotSend;
    const assetContractName = 'sip009'
    const assetName = 'sip009'
    const tokenAssetName = bufferCVFromString('sip009')
    const nonFungibleAssetInfo = createAssetInfo (
        assetAddress,
        assetContractName,
        assetName
        )

    const postConditions = [
        makeStandardNonFungiblePostCondition(
            postConditionAddress,
            postConditionCode,
            postConditionAddress,
            nonFungibleAssetInfo,
            tokenAssetName
            ),
                            ];
    
    const options = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: auctionContractAddress,
        contractName: "auction",
        functionName: "set-whitelisted",
        functionArgs,
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
     await doContractCall(options);
   
}

// function setWhitelist (assetWhitelist) {
//   const { doContractCall } = useConnect();

  
//  doContractCall({
//        postConditions: [
//           makeStandardNonFungiblePostCondition(
//             PostConditionAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
//             assetAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
//             PostConditionCode: NonFungibleConditionCode.DoesNotSend,
//             assetContractName: 'sip009',
//             assetName: 'sip009',
//             tokenAssetName: bufferCVFromString('sip009'),
//            nonFungibleAssetInfo: createAssetInfo (
//                assetAddress,
//                assetContractName,
//                assetName
//                ),
//               nonFungibleAssetInfo,
//               tokenAssetName
//               ),
//                               ],
      
//        options: {
//           network,
//           anchorMode: AnchorMode.Any,
//           contractAddress: auctionContractAddress,
//           contractName: "auction",
//           functionName: "set-whitelisted",
//           functionArgs,
//           postConditions,
          
//           // appDetails: {
//           //     name: "Auction",
//           //     icon: window.location.origin + "/vercel.svg",
//           // },
//           onFinish: (data) => {
//               // console.log(data)
//               console.log("Stacks Transaction:", data.stacksTransaction);
//               console.log("Transaction ID:", data.txId);
//               console.log("Raw transaction:", data.txRaw);
//           },
//       }
// })

// }
  

  if (!mounted || !userSession.isUserSignedIn()) {
    return null;
  }

  return (

    <div>

    <form onSubmit={whitelistNFT} className='lg:w-1/3 sm:w-2/3 '>
                <div className=' flex items-center border border-gray-600 my-4 mx-4 rounded'>
                    <div className='flex-shrink-0 bg-gray-600 text-gray-100 text-sm py-2 px-6'>
                        Asset id  
                    </div>
                    <input 
                    type="text" 
                    value={assetWhitelist} 
                    id='whiteListAssetId' 
                    onChange={handleAssetWhitelistChange} 
                    placeholder="eg 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009"  
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
