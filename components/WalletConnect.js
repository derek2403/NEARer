import React, { useState, useEffect } from 'react';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

const WalletConnect = () => {
  const [selector, setSelector] = useState(null);
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    initWalletSelector();
  }, []);

  const initWalletSelector = async () => {
    const walletSelector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupMyNearWallet(),
        // Add other wallet modules here
      ],
    });

    const newModal = setupModal(walletSelector, {
      contractId: "guest-book.testnet" // Replace with your contract ID
    });

    setSelector(walletSelector);
    setModal(newModal);

    const state = walletSelector.store.getState();
    setAccounts(state.accounts);

    // Subscribe to changes in wallet state
    walletSelector.store.observable.subscribe((state) => {
      setAccounts(state.accounts);
    });
  };

  const handleWalletConnect = () => {
    if (!modal) return;
    modal.show();
  };

  const handleWalletDisconnect = async () => {
    if (!selector) return;
    const wallet = await selector.wallet();
    await wallet.signOut();
  };

  return (
    <div className="bg-white min-h-[80px] flex items-center justify-center">
      {accounts.length === 0 ? (
        <button
          onClick={handleWalletConnect}
          className="px-6 py-2 font-medium bg-green-500 text-white w-fit transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <button
            onClick={handleWalletDisconnect}
            className="px-6 py-2 font-medium bg-green-500 text-white w-fit transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;