import React, { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const CHAIN_CONFIGS = [
  { name: 'Ethereum', prefix: 'ethereum', chainId: 11155111, rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4' },
  { name: 'Polygon', prefix: 'polygon', chainId: 80001, rpcUrl: 'https://rpc-amoy.polygon.technology/' },
  { name: 'Optimism', prefix: 'optimism', chainId: 11155420, rpcUrl: 'https://sepolia.optimism.io' }
];

export default function MultiChainWalletViewer() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWallets = async () => {
    setIsLoading(true);
    setError('');
    setWallets([]);

    try {
      for (const chain of CHAIN_CONFIGS) {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        let index = 1;
        let hasBalance = true;

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
            setWallets(prev => [...prev, {
              chain: chain.name,
              address: adapter.address,
              balance: ethers.formatEther(balance),
              derivationPath
            }]);
            index++;
          } else {
            hasBalance = false;
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Multi-Chain Wallet Viewer</h1>
      
      <button 
        onClick={fetchWallets} 
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Fetching Wallets...' : 'Fetch Wallets'}
      </button>

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {wallets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet, index) => (
              <div key={index} className="border p-4 rounded shadow">
                <h3 className="font-bold">{wallet.chain}</h3>
                <p className="text-sm break-all">Address: {wallet.address}</p>
                <p>Balance: {wallet.balance} {wallet.chain === 'Polygon' ? 'MATIC' : 'ETH'}</p>
                <p className="text-xs text-gray-500">Path: {wallet.derivationPath}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}