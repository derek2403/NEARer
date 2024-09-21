import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const CHAIN_CONFIGS = [
  {
    name: 'Ethereum',
    prefix: 'ethereum',
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4',
    symbol: 'ETH',
  },
  {
    name: 'Polygon',
    prefix: 'polygon',
    chainId: 80001,
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    symbol: 'MATIC',
  },
  {
    name: 'Optimism',
    prefix: 'optimism',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    symbol: 'ETH', // Assuming Optimism uses ETH; adjust if different
  },
];

export default function ListWallet() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWallets = async () => {
      setIsLoading(true);
      setError('');
      setWallets([]);

      try {
        // Use Promise.all to handle multiple chains concurrently
        const walletsPerChain = await Promise.all(
          CHAIN_CONFIGS.map(async (chain) => {
            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            let index = 1;
            let hasBalance = true;
            const chainWallets = [];

            while (hasBalance) {
              const derivationPath = `${chain.prefix},${index}`;
              const adapter = await setupAdapter({
                accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
                privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
                mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
                derivationPath: derivationPath,
              });

              const balance = await provider.getBalance(adapter.address);

              if (balance > BigInt(0)) {
                chainWallets.push({
                  chain: chain.name,
                  address: adapter.address,
                  balance: ethers.formatEther(balance),
                  derivationPath,
                  symbol: chain.symbol,
                });
                index++;
              } else {
                hasBalance = false;
              }
            }

            return chainWallets;
          })
        );

        // Flatten the array of arrays
        const allWallets = walletsPerChain.flat();
        setWallets(allWallets);
      } catch (err) {
        console.error('Error fetching wallets:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Multi-Chain Wallet Viewer</h1>

      {isLoading && (
        <p className="text-blue-500 mt-4">Fetching wallets, please wait...</p>
      )}

      {error && (
        <p className="text-red-500 mt-4">Error: {error}</p>
      )}

      {!isLoading && !error && wallets.length === 0 && (
        <p className="text-gray-500 mt-4">No wallets with a balance were found.</p>
      )}

      {wallets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet, index) => (
              <div key={`${wallet.chain}-${wallet.address}-${index}`} className="border p-4 rounded shadow">
                <h3 className="font-bold">{wallet.chain}</h3>
                <p className="text-sm break-all">Address: {wallet.address}</p>
                <p>
                  Balance: {wallet.balance} {wallet.symbol}
                </p>
                <p className="text-xs text-gray-500">Path: {wallet.derivationPath}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}