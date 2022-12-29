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