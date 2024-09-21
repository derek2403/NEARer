import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const CHAIN_CONFIGS = [
  {
    name: 'Ethereum',
    chainId: 11155111, // Sepolia
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4',
    derivationPrefix: 'ethereum',
    color: '#627EEA'
  },
  {
    name: 'Optimism',
    chainId: 11155420, // Optimism Testnet
    rpcUrl: 'https://sepolia.optimism.io',
    derivationPrefix: 'optimism',
    color: '#FF0420'
  },
  {
    name: 'Polygon',
    chainId: 80002, // Mumbai Testnet
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    derivationPrefix: 'polygon',
    stakingContract: '0x3456789012345678901234567890123456789012', // Replace with actual contract address
    color: '#8247E5'
  }
];

export default function MultiChainViewerPolygonStaking() {
  const [wallets, setWallets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setIsLoading(true);
    setError('');
    const newWallets = {};

    try {
      for (const chain of CHAIN_CONFIGS) {
        newWallets[chain.name] = [];
        let index = 1;
        let hasBalance = true;

        while (hasBalance) {
          const derivationPath = `${chain.derivationPrefix},${index}`;
          const adapter = await setupAdapter({
            accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
            privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
            mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
            derivationPath: derivationPath,
          });

          const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
          const balance = await provider.getBalance(adapter.address);

          if (balance > BigInt(0)) {
            newWallets[chain.name].push({
              address: adapter.address,
              balance: ethers.formatEther(balance),
              derivationPath
            });
            index++;
          } else {
            hasBalance = false;
          }
        }
      }
      setWallets(newWallets);
    } catch (err) {
      setError(`Error fetching wallets: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stakeAllPolygon = async () => {
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const polygonConfig = CHAIN_CONFIGS.find(chain => chain.name === 'Polygon');
      const polygonWallets = wallets['Polygon'];

      for (const wallet of polygonWallets) {
        const adapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const provider = new ethers.JsonRpcProvider(polygonConfig.rpcUrl);
        const gasPrice = await provider.getFeeData();
        const gasLimit = 21000; // Basic transaction gas limit
        const gasCost = gasPrice.gasPrice * BigInt(gasLimit);

        const balance = ethers.parseEther(wallet.balance);
        const amountToStake = balance - gasCost;

        if (amountToStake > 0) {
          const tx = await adapter.signAndSendTransaction({
            to: polygonConfig.stakingContract,
            value: amountToStake,
            chainId: polygonConfig.chainId,
            gasLimit: gasLimit,
            gasPrice: gasPrice.gasPrice,
          });

          setResults(prev => [...prev, {
            address: wallet.address,
            amount: ethers.formatEther(amountToStake),
            txHash: tx
          }]);
        } else {
          setResults(prev => [...prev, {
            address: wallet.address,
            amount: '0',
            txHash: 'Insufficient balance after gas costs'
          }]);
        }
      }
    } catch (err) {
      setError(`Error staking: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Multi-Chain Viewer with Polygon Staking</h1>
      
      {CHAIN_CONFIGS.map(chain => (
        <div key={chain.name} className="mb-6">
          <h2 className="text-2xl font-semibold mb-2" style={{color: chain.color}}>{chain.name} Wallets</h2>
          {wallets[chain.name]?.map((wallet, index) => (
            <div key={index} className="mb-2 p-2 border rounded" style={{borderColor: chain.color}}>
              <p>Address {index + 1}: {wallet.address}</p>
              <p>Balance: {wallet.balance} {chain.name === 'Polygon' ? 'MATIC' : 'ETH'}</p>
              <p className="text-sm text-gray-500">Path: {wallet.derivationPath}</p>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={stakeAllPolygon}
        disabled={isLoading}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Staking...' : 'Stake All Polygon Wallets'}
      </button>

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Polygon Staking Results</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded" style={{ borderColor: CHAIN_CONFIGS.find(c => c.name === 'Polygon').color }}>
              <p>Address: {result.address}</p>
              <p>Amount Staked: {result.amount} MATIC</p>
              <p className="text-sm break-all">Transaction Hash: {result.txHash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}