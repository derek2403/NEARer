// contexts/WalletSelectorContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

const WalletSelectorContext = createContext(null);

export const WalletSelectorContextProvider = ({ children }) => {
  const [selector, setSelector] = useState(null);
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setupWalletSelector({
      network: "testnet",
      modules: [setupMyNearWallet()],
    }).then(async (selector) => {
      const _modal = setupModal(selector, { contractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID });
      const state = selector.store.getState();
      setAccounts(state.accounts);

      window.selector = selector;
      window.modal = _modal;

      setSelector(selector);
      setModal(_modal);
    });
  }, []);

  useEffect(() => {
    if (!selector) return;

    const subscription = selector.store.observable
      .subscribe((state) => {
        setAccounts(state.accounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  const walletSelectorContextValue = {
    selector,
    modal,
    accounts,
  };

  return (
    <WalletSelectorContext.Provider value={walletSelectorContextValue}>
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);
  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }
  return context;
}