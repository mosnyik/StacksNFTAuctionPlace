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

    const network = new StacksMocknet()

    const mint = async () => {
        const assetAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'

        const functionArgs = [
            standardPrincipalCV(
                userSession.loadUserData().profile.stxAddress.testnet
            ),
        ]

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
                // console.log(data)
                window.alert(`NFT minted successfully`)
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
            className='bg-gray-100 px-6 py-2 rounded-full border border-gray-600 hover:border-gray-100 hover:bg-gray-500 hover:text-gray-100 font-semibold'>
                 Mint NFT
            </button>
        </div>
     );
}
 
export default MintNFT;

// const functionArgs = [ 
    //     stringUtf8CV(assetId), 
    //     uintCV(tokenId), 
    //     uintCV(startPrice * 1000000), 
    //     uintCV(auctionDuration),
    // ];

    // const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    // const nftPostConditionCode = NonFungibleConditionCode.Sends;
    // const assetContractName = 'sip009'
    // const assetName = 'auctionnft'
    // const assetAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    // const tokenAssetName = bufferCVFromString('auctionnft')
    // const nonFungibleAssetInfo = createAssetInfo(
    //         assetAddress,
    //         assetContractName,
    //         assetName
    // )

    // const postConditions = [
    //     makeStandardNonFungiblePostCondition(
    //         postConditionAddress,
    //         nftPostConditionCode,
    //         nonFungibleAssetInfo,
    //         tokenAssetName
    //         ),
        
    // ]
    
  //   const options = {
  //       network,
  //       anchorMode: AnchorMode.Any,
  //       contractAddress: auctionContractAddress ,
  //       contractName: "auction",
  //       functionName: "create-auction",
  //       functionArgs,
  //       postConditionMode: PostConditionMode.Deny,
  //       // postConditions,
        
  //       appDetails: {
  //           name: "Auction",
  //           icon: window.location.origin + "/vercel.svg",
  //       },
  //       onFinish: (data) => {
  //           // console.log(data)
  //           console.log("Stacks Transaction:", data.stacksTransaction);
  //           console.log("Transaction ID:", data.txId);
  //           console.log("Raw transaction:", data.txRaw);
  //       },
  //   }
  //  const tx = await doContractCall(options);