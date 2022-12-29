import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["publish_data"]);

export const userSession = new UserSession({ appConfig });

// function for authenticating user
function authenticate() {
  showConnect({
    appDetails: {
      name: "NFT Auction Place",
      icon: window.location.origin + "/logo512.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

// function to diconnect wallet
function disconnect() {
  userSession.signUserOut("/");
}
// function for connecting wallet
const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
      <div>
        <button className="bg-white hover:bg-gray-100 px-4 py-1 border border-gray-600 text-gray-400  hover:text-gray-800 shadow justify-start mb-4 rounded-full" onClick={disconnect}>
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <button className="bg-white hover:bg-gray-100 px-4 py-1 border border-gray-600 text-gray-400  hover:text-gray-800 shadow justify-center mb-8 rounded-full" onClick={authenticate}>
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;
