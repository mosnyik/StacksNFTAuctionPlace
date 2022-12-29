import Link from 'next/link'
import ConnectWallet from './ConnectWallet'
// import { useState, useEffect } from 'react'
// import { AppConfig, UserSession, showConnect} from '@stacks/connect'


const NavBar = () => {
    // const appConfig = new AppConfig(['publish_data'])
    // const userSession = new UserSession ({appConfig})

    // const [userData, setUserData] = useState({});
    // const [loggedIn, setLoggedIn] = useState(false);
    // const [buttonText, setbuttonText] = useState('Connect Wallet');


//       // function to connect our statcks wallet
//   function authenticate() {
//     showConnect({
//         appDetails: {
//             name: "NFT Auction Place",
//             icon: "https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg",
//         },
//         redirectTo: "/",
//         onFinish: () => {
//             window.location.reload();
//         },
//         userSession,
//     });
// }

// useEffect(() => {
//     if (userSession.isSignInPending()) {
//       userSession.handlePendingSignIn().then((userData) => {
//         setUserData(userData);
//       });
    
//     console.log('Logged In')
      
//     } else if (userSession.isUserSignedIn()) {
//       setLoggedIn(true);
//       setbuttonText("Wallet Connected");
//       setUserData(userSession.loadUserData());
//     }
//   }, []);
    return ( 

        (<div className= 'p-10 flex flex-nowrap space-x-4 drop-shadow-lg bg-slate-100 h-10 justify-around ' >
            <div>NFT Auction Place</div>
            <div className='px-10 flex flex-row justify-around space-x-6'>  
                <div className='hover:underline '>
                    <Link href = {'/'}>
                        Home
                    </Link>
                </div>
                <div className='hover:underline '>
                    <Link href = {'/auction'}>
                        Create Auction
                    </Link>
                </div>
                <div className='hover:underline '>
                    <Link href = {'/bid'}>
                        Bid
                    </Link>
                </div>
            </div>
            <div>
                <ConnectWallet />
            {/* <button onClick={() => authenticate()} className='bg-white hover:bg-gray-100 px-4 py-1 border border-gray-600 text-gray-400  hover:text-gray-800 shadow justify-start mb-4 rounded-full'>
                {buttonText}
            </button> */}
            </div>
        </div>)
         
     );
     
}
 
export default NavBar;