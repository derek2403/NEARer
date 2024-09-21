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
  ethereum: ['ethereum,100', 'ethereum,101'],
  optimism: 'optimism,100',
  polygon: 'polygon,100'
};

const FIXED_TRANSFER_AMOUNT = '0.001';

export default function AutoMultiChainBridgeTransferEthereum() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [availableWallets, setAvailableWallets] = useState({
    optimism: [],
    polygon: []
  });

  useEffect(() => {
    fetchAvailableWallets();
  }, []);

  useEffect(() => {
    if (availableWallets.optimism.length > 0 || availableWallets.polygon.length > 0) {
      handleTransfer();
    }
  }, [availableWallets]);

  const fetchAvailableWallets = async () => {
    const opWallets = await getWalletsWithBalance('optimism');
    const polyWallets = await getWalletsWithBalance('polygon');
    setAvailableWallets({
      optimism: opWallets,
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
        opTxHashes: [],
        polygonTxHashes: []
      };

      for (const wallet of availableWallets.optimism) {
        const opAdapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const opAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
        const txHash = await opAdapter.signAndSendTransaction({
          to: await getWalletAddress(HARDCODED_WALLETS.ethereum[0]),
          value: opAmount,
          chainId: CHAIN_CONFIGS.optimism.chainId,
        });
        results.opTxHashes.push(txHash);
      }

      const polygonAdapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: HARDCODED_WALLETS.polygon,
      });

      const maticAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
      const txHash = await polygonAdapter.signAndSendTransaction({
        to: await getWalletAddress(HARDCODED_WALLETS.ethereum[1]),
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
      <h1 className="text-3xl font-bold mb-4">Automated Multi-Chain Bridge Transfer to Ethereum</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Available Wallets</h2>
        <h3 className="text-lg mt-2">Optimism Wallets:</h3>
        <ul>
          {availableWallets.optimism.map((wallet, index) => (
            <li key={index}>{wallet.derivationPath} - Balance: {wallet.balance} OP</li>
          ))}
        </ul>
        <h3 className="text-lg mt-2">Polygon Wallet:</h3>
        <ul>
          {availableWallets.polygon.map((wallet, index) => (
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
          <h3 className="text-lg">Optimism Transactions:</h3>
          <ul>
            {result.opTxHashes.map((hash, index) => (
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