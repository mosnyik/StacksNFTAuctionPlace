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

/**
 * / POSTCONDITION FOR NFT TRANSFER WITH STANDARD PRINCIPAL /
 * 
 * // address that the NFT is transfered to 
 * const postConditionAddress = 'ADDRESS OF THE NFT RECIEVER';
 * // condition that the NFT must be owned by the speficified address above
 * const postConditionCode = NonFungibleConditionCode.Owns;
 * 
 * const assetAddress = 'NFT CONTRACT IDENTIFIER'
 * const assetContractName = 'CONTRACT ADDRESS AS ASPECIFIED IN THE CONTRACT';
 * const assetName = 'NAME OF THE NFT';
 * const tokenAssetName = bufferCVFromString('NAME OF THE NFT');
 * NonFungibeAssetInfo = createAssetInfo(assetAddress, assetContractName, assetName);
 * 
 * const standardNonFungiblePostCondition = makeStandardNonFungibleCondition(
 *  postConditionAddress,
 *  postConditionCode,
 *  nonFungibleAssetInfo,
 *  tokenAddressName
 * );
 * 
 * / POSTCONDITION FOR NFT TRANSFER WITH CONTRACT PRINCIPAL /
 * 
 * const contractAddress = 'ADDRESS OF THE CONTRACT THAT RECIEVES THE NFT',
 * const contractName = '';
 * 
 * const contractNonFungiblePostCondition = makeStandardNonFungibleCondition(
 *  contractAddress,
 *  contractName
 *  postConditionCode,
 *  nonFungibleAssetInfo,
 *  tokenAddressName
 * );
 */