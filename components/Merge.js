import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const POLYGON_CONFIG = {
  name: 'Polygon',
  prefix: 'polygon',
  chainId: 80002,
  rpcUrl: 'https://rpc-amoy.polygon.technology/'
};

export default function Merge() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [consolidatedWallet, setConsolidatedWallet] = useState(null); // To store the first wallet's consolidated balance

  useEffect(() => {
    fetchWallets();
  }, []);

  // Fetch wallets and start consolidation automatically
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

      // Start consolidation automatically if there are multiple wallets
      if (newWallets.length > 1) {
        await consolidateFunds(newWallets);
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
    setResults([]);

    const targetWallet = walletsToConsolidate[0];
    const sourceWallets = walletsToConsolidate.slice(1);
    let totalBalance = ethers.BigNumber.from(0); // To sum up the total balance after consolidation

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
          const tx = await adapter.signAndSendTransaction({
            to: targetWallet.address,
            value: amountToSend,
            chainId: POLYGON_CONFIG.chainId,
            gasLimit: gasLimit,
            gasPrice: gasPrice.gasPrice,
          });

          // Add up the balance
          totalBalance = totalBalance.add(amountToSend);

          setResults(prev => [...prev, {
            from: wallet.address,
            to: targetWallet.address,
            amount: ethers.formatEther(amountToSend),
            txHash: tx
          }]);
        }
      }

      // Set the consolidated wallet balance
      setConsolidatedWallet({
        address: targetWallet.address,
        balance: ethers.formatEther(totalBalance.add(ethers.parseEther(targetWallet.balance))) // Add the original target wallet balance
      });
    } catch (err) {
      setError(`Error consolidating funds: ${err.message}`);
    } finally {
      setIsLoading(false);
      fetchWallets(); // Refresh wallet balances after consolidation
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Consolidate Polygon Funds</h1>

      {isLoading && <p>Consolidating funds, please wait...</p>}

      <h2 className="text-2xl font-semibold mb-2">Consolidated Wallet</h2>
      {consolidatedWallet ? (
        <div className="mb-4 p-4 border rounded">
          <p>Address: {consolidatedWallet.address}</p>
          <p>Balance: {consolidatedWallet.balance} MATIC</p>
        </div>
      ) : (
        <p>No wallets available or not enough wallets to consolidate.</p>
      )}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Consolidation Results</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <p>From: {result.from}</p>
              <p>To: {result.to}</p>
              <p>Amount Sent: {result.amount} MATIC</p>
              <p className="text-sm break-all">Transaction Hash: {result.txHash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}