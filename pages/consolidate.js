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
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchWallets();
  }, []);

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
    } catch (err) {
      setError(`Error fetching wallets: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const consolidateFunds = async () => {
    setIsLoading(true);
    setError('');
    setResults([]);

    if (wallets.length < 2) {
      setError('Not enough wallets to consolidate funds.');
      setIsLoading(false);
      return;
    }

    const targetWallet = wallets[0];
    const sourceWallets = wallets.slice(1);

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

          setResults(prev => [...prev, {
            from: wallet.address,
            to: targetWallet.address,
            amount: ethers.formatEther(amountToSend),
            txHash: tx
          }]);
        } else {
          setResults(prev => [...prev, {
            from: wallet.address,
            to: targetWallet.address,
            amount: '0',
            txHash: 'Insufficient balance after gas costs'
          }]);
        }
      }
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
      
      <button
        onClick={consolidateFunds}
        disabled={isLoading || wallets.length < 2}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {isLoading ? 'Consolidating...' : 'Consolidate Funds'}
      </button>

      <h2 className="text-2xl font-semibold mb-2">Polygon Wallets</h2>
      {wallets.map((wallet, index) => (
        <div key={index} className="mb-2 p-2 border rounded">
          <p>Address {index + 1}: {wallet.address}</p>
          <p>Balance: {wallet.balance} MATIC</p>
          <p className="text-sm text-gray-500">Path: {wallet.derivationPath}</p>
        </div>
      ))}

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