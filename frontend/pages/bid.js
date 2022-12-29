import NavBar from '../components/NavBar'
import {
    AppConfig,
    UserSession,
    openContractCall,
} from "@stacks/connect";

import { 
    uintCV, 
    stringUtf8CV, 
    standardPrincipalCV,
    hexToCV,
    cvToHex,
    NonFungibleConditionCode,
    createAssetInfo,
    makeStandardNonFungiblePostCondition,
    makeStandardSTXPostCondition,
    FungibleConditionCode,
    bufferCVFromString, 
    broadcastTransaction, 
    AnchorMode,
    makeContractCall,
    } from "@stacks/transactions";
import { StacksMocknet } from "@stacks/network";
import { useState, useEffect } from 'react';
import PlaceBid from '../components/PlaceABid';
import { Connect, } from "@stacks/connect-react";



export default function Home() {
    const appConfig = new AppConfig(["publish_data"]);
    const userSession = new UserSession({ appConfig });

    const [bidAmount, setBidAmount] = useState(0)
    const [auctionId, setAuctionId] = useState(0)
    const [tokenId, setTokenId] = useState(0)
    const [auctionContractAddress, setAuctionContractAddress] = useState(
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    const [userData, setUserData] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);
    const [auctionContractName, setAuctionContractName] = useState("auction");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const authOption = {
        appDetails: {
          name: 'auction',
          icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
        },
        redirectTo: '/',
        userSession: userSession,
      }

    const network = new StacksMocknet();

    const handleBidAmountChange = (e) => {
        setBidAmount(e.target.value);
      };

    const handleAuctionIdChange = (e) => {
        setAuctionId(e.target.value);
          };

    const handleTokenIdChange = (e) => {
        setTokenId(e.target.value);
      };

    const placeBid =  async (e) =>{
        e.preventDefault();
        const functionArgs = [ 
            uintCV(tokenId), 
            uintCV(bidAmount * 1000000), 
            uintCV(auctionId),
        ];

        const postConditionAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
        const stxConditionCode = FungibleConditionCode.GreaterEqual;
        const stxConditionAmount = bidAmount * 1000000;
        const assetAddress = 'SP62M8MEFH32WGSB7XSF9WJZD7TQB48VQB5ANWSJ';
        const assetContractName = 'auction';
        const fungibleAssetInfo = createAssetInfo(assetAddress, assetContractName);

        const postConditions = [

            makeStandardSTXPostCondition(
                postConditionAddress,
                stxConditionCode,
                stxConditionAmount,
                fungibleAssetInfo
               )
         ];

        const options = {
            contractAddress: auctionContractAddress,
            contractName: "auction",
            functionName: "place-a-bidsr",
            functionArgs,
            network,
            postConditions,
            anchorMode: AnchorMode.Any,
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
    
       await openContractCall(options);

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

 /**
     * / STX transfer with a standard principal that is the principal that is not a contract/
     * 
     * // the user with this contractAddress would perform the transaction
     * const postConditionAddress = 'STANDARD PRINCIPAL THAT MAKES TRANSFER';
     * // the contractAddress would transfer and amount >= the specified amount 
     * const postConditionCode = FungibleConditionCode.GreaterEqual;
     * // specified amount for the transfer
     * const postConditionAmount = 12345n;
     * 
     * const standardSTXPostCondition = makeStandardSTXPostCondition(
     *  postConditionAddress,
     *  postCnditionCode,
     *  postConditionAmount,
     * );
     * 
     * // so in english language, the above code says, you are about to make a 
     * // transfer and you br transfering 12,345 STX or more other wise the 
     * // operation will abort
     * 
     * / STX transfer with a standard principal /
     * 
     * const contractAddress = 'CONTRACT PRINCIPAL';
     * const contractName = 'test-contract';
     * 
     * const contractSTXPostCondition = makeContractSTXPostCondition(
     *  contractAddress,
     *  contractName,
     *  postContractCode,
     *  postConditionAmount,
     * )
     * 
     * // the above code is doing the exact same thing, but for a contract 
     * // as against the user in the firt instance
     */