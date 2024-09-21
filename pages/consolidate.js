import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const POLYGON_CONFIG = {
  name: 'Polygon',
  prefix: 'polygon',
  chainId: 80002,
  rpcUrl: 'https://rpc-amoy.polygon.technology/'
};

export default function ConsolidatePolygonFunds() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [consolidatedBalance, setConsolidatedBalance] = useState(null); // Consolidated balance for the first wallet

  useEffect(() => {
    fetchWallets();
  }, []);

  // Fetch wallets and trigger consolidation automatically
  const fetchWallets = async () => {
    setIsLoading(true);
    setError('');
    const newWallets = [];

    try {
      const provider = new ethers.JsonRpcProvider(POLYGON_CONFIG.rpcUrl);
      let index = 1;
      let hasBalance = true;

      while (hasBalance) {
        const derivationPath = `${POLYGON_CONFIG.prefix},${index}`;
        const adapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: derivationPath,
        });

        const balance = await provider.getBalance(adapter.address);
        
        if (balance > BigInt(0)) {
          newWallets.push({
            address: adapter.address,
            balance: ethers.formatEther(balance),
            derivationPath
          });
          index++;
        } else {
          hasBalance = false;
        }
      }
      setWallets(newWallets);

      if (newWallets.length > 1) {
        // Automatically trigger consolidation after fetching wallets
        await consolidateFunds(newWallets);
      } else {
        setError('Not enough wallets to consolidate funds.');
      }
    } catch (err) {
      setError(`Error fetching wallets: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const consolidateFunds = async (walletsToConsolidate) => {
    setIsLoading(true);
    setError('');

    const targetWallet = walletsToConsolidate[0];
    const sourceWallets = walletsToConsolidate.slice(1);
    let totalBalance = ethers.BigNumber.from(ethers.parseEther(targetWallet.balance)); // Start with target wallet balance

    try {
      const provider = new ethers.JsonRpcProvider(POLYGON_CONFIG.rpcUrl);

      for (const wallet of sourceWallets) {
        const adapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const gasPrice = await provider.getFeeData();
        const gasLimit = 21000; // Basic transaction gas limit
        const gasCost = gasPrice.gasPrice * BigInt(gasLimit);

        const balance = ethers.parseEther(wallet.balance);
        const amountToSend = balance - gasCost;

        if (amountToSend > 0) {
          // Simulate transaction and add to total balance
          totalBalance = totalBalance.add(amountToSend);
        }
      }

      // Set the consolidated balance of the first wallet
      setConsolidatedBalance(ethers.formatEther(totalBalance));
    } catch (err) {
      setError(`Error consolidating funds: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Consolidate Polygon Funds</h1>

      {isLoading && <p>Consolidating funds, please wait...</p>}

      <h2 className="text-2xl font-semibold mb-2">Consolidated Wallet</h2>
      {consolidatedBalance !== null ? (
        <div className="mb-4 p-4 border rounded">
          <p>Address: {wallets[0]?.address}</p>
          <p>Balance: {consolidatedBalance} MATIC</p>
        </div>
      ) : (
        <p>No wallets available or not enough wallets to consolidate.</p>
      )}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}
    </div>
  );
}