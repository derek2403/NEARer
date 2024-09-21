import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const CHAIN_CONFIGS = {
  ethereum: {
    name: 'Ethereum',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4',
    chainId: 11155111
  },
  optimism: {
    name: 'Optimism',
    rpcUrl: 'https://sepolia.optimism.io',
    chainId: 11155420
  },
  polygon: {
    name: 'Polygon',
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    chainId: 80002
  }
};

const HARDCODED_WALLETS = {
  ethereum: 'ethereum,100',
  optimism: ['optimism,100', 'optimism,101'],
  polygon: 'polygon,100'
};

const FIXED_TRANSFER_AMOUNT = '0.001';

export default function AutoMultiChainBridgeTransferOptimism() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [availableWallets, setAvailableWallets] = useState({
    ethereum: [],
    polygon: []
  });

  useEffect(() => {
    fetchAvailableWallets();
  }, []);

  useEffect(() => {
    if (availableWallets.ethereum.length > 0 || availableWallets.polygon.length > 0) {
      handleTransfer();
    }
  }, [availableWallets]);

  const fetchAvailableWallets = async () => {
    const ethWallets = await getWalletsWithBalance('ethereum');
    const polyWallets = await getWalletsWithBalance('polygon');
    setAvailableWallets({
      ethereum: ethWallets,
      polygon: polyWallets
    });
  };

  const getWalletsWithBalance = async (chain) => {
    const wallets = [];
    let index = 1;
    let hasBalance = true;

    while (hasBalance) {
      const derivationPath = `${chain},${index}`;
      try {
        const adapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: derivationPath,
        });

        const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chain].rpcUrl);
        const balance = await provider.getBalance(adapter.address);

        if (balance > BigInt(0)) {
          wallets.push({
            derivationPath,
            address: adapter.address,
            balance: ethers.formatEther(balance)
          });
          index++;
        } else {
          hasBalance = false;
        }
      } catch (err) {
        console.error(`Error fetching wallet for ${chain},${index}:`, err);
        hasBalance = false;
      }
    }

    return wallets;
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const results = {
        ethTxHashes: [],
        polygonTxHashes: []
      };

      for (const wallet of availableWallets.ethereum) {
        const ethAdapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const ethAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
        const txHash = await ethAdapter.signAndSendTransaction({
          to: await getWalletAddress(HARDCODED_WALLETS.optimism[0]),
          value: ethAmount,
          chainId: CHAIN_CONFIGS.ethereum.chainId,
        });
        results.ethTxHashes.push(txHash);
      }

      const polygonAdapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: HARDCODED_WALLETS.polygon,
      });

      const maticAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
      const txHash = await polygonAdapter.signAndSendTransaction({
        to: await getWalletAddress(HARDCODED_WALLETS.optimism[1]),
        value: maticAmount,
        chainId: CHAIN_CONFIGS.polygon.chainId,
      });
      results.polygonTxHashes.push(txHash);

      setResult(results);
    } catch (err) {
      setError(`Transfer failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletAddress = async (derivationPath) => {
    const adapter = await setupAdapter({
      accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
      privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
      mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
      derivationPath: derivationPath,
    });
    return adapter.address;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Automated Multi-Chain Bridge Transfer to Optimism</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Available Wallets</h2>
        <h3 className="text-lg mt-2">Ethereum Wallets:</h3>
        <ul>
          {availableWallets.ethereum && availableWallets.ethereum.map((wallet, index) => (
            <li key={index}>{wallet.derivationPath} - Balance: {wallet.balance} ETH</li>
          ))}
        </ul>
        <h3 className="text-lg mt-2">Polygon Wallet:</h3>
        <ul>
          {availableWallets.polygon && availableWallets.polygon.map((wallet, index) => (
            <li key={index}>{wallet.derivationPath} - Balance: {wallet.balance} MATIC</li>
          ))}
        </ul>
      </div>

      {isLoading && <p>Processing transfers...</p>}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Transfer Results</h2>
          <h3 className="text-lg">ETH Transactions:</h3>
          <ul>
            {result.ethTxHashes.map((hash, index) => (
              <li key={index}>{hash}</li>
            ))}
          </ul>
          <h3 className="text-lg mt-2">Polygon Transactions:</h3>
          <ul>
            {result.polygonTxHashes.map((hash, index) => (
              <li key={index}>{hash}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}