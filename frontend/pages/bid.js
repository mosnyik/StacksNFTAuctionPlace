import NavBar from '../components/NavBar'
import {
    AppConfig,
    UserSession,
} from "@stacks/connect";

import { useState, useEffect } from 'react';
import PlaceBid from '../components/PlaceABid';
import { Connect, } from "@stacks/connect-react";



export default function Home() {
    const appConfig = new AppConfig(["publish_data"]);
    const userSession = new UserSession({ appConfig });

    const [userData, setUserData] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);

    const authOption = {
        appDetails: {
          name: 'auction',
          icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
        },
        redirectTo: '/',
        userSession: userSession,
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