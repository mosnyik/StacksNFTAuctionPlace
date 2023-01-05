import NavBar from '../components/NavBar'
import MintNFT from '../components/MintSIP009';
import SettleAuction from '../components/SettleAuction';
import { userSession } from "@stacks/connect";
import { Connect, } from "@stacks/connect-react";

export default function Home() {
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
      <div>
        <h2 className='font-bold py-8 px-4 text-2xl'>
          The NFT Place
        </h2>
        <p className='px-4 text-lg '>
          Welcome to the NFT Auction Place,
          you are welcome to create an Auction or place a bid
          just go ahead and connect your wallet and you are all set to roll
        </p>
        <h2 className='font-bold py-4 px-4 text-2xl'>
        Mint a token and try the platform
        </h2>
        
      </div >
      <div className = ' px-4 '>
      < MintNFT />
      </div>
      <div>
      <h2 className='font-bold py-4 px-4 text-2xl'>
        Claim your win or request a refund here
        </h2>
        <p className='px-4 text-lg '>
          Just provide the contract you bidded for and the auction id
        </p>
      </div>
      <div className = ' px-4 '>
        {/*
            implimentation of settle auction
             */}
            <Connect authOptions={authOption}>
            < SettleAuction />
            </Connect>
      
      </div>
    </div>
  )
}
