import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const HERMES_BASE_URL = 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=';
const PRICE_IDS = {
  ethUsd: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  opUsd: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
  maticUsd: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
};

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
  optimism: 'optimism,100',
  polygon: ['polygon,100', 'polygon,101']
};

const FIXED_TRANSFER_AMOUNT = '0.001';
const POLYGON_WALLET_ID = 'polygon,1';

export default function AutoMultiChainBridgeTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [availableWallets, setAvailableWallets] = useState({
    ethereum: [],
    optimism: []
  });

  // Fetch available wallets when the component is mounted
  useEffect(() => {
    fetchAvailableWallets();
  }, []);

  // Automatically trigger the transfer after wallets have been fetched
  useEffect(() => {
    if (availableWallets.ethereum.length > 0 || availableWallets.optimism.length > 0) {
      handleTransfer();
    }
  }, [availableWallets]);

  const fetchAvailableWallets = async () => {
    const ethWallets = await getWalletsWithBalance('ethereum');
    const opWallets = await getWalletsWithBalance('optimism');
    setAvailableWallets({
      ethereum: ethWallets,
      optimism: opWallets
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
        opTxHashes: [],
        polygonTxHashes: []
      };

      // Transfer ETH from all available Ethereum wallets
      for (const wallet of availableWallets.ethereum) {
        const ethAdapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const ethAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
        const txHash = await ethAdapter.signAndSendTransaction({
          to: await getWalletAddress(HARDCODED_WALLETS.ethereum),
          value: ethAmount,
          chainId: CHAIN_CONFIGS.ethereum.chainId,
        });
        results.ethTxHashes.push(txHash);
      }

      // Transfer OP from all available Optimism wallets
      for (const wallet of availableWallets.optimism) {
        const opAdapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet.derivationPath,
        });

        const opAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
        const txHash = await opAdapter.signAndSendTransaction({
          to: await getWalletAddress(HARDCODED_WALLETS.optimism),
          value: opAmount,
          chainId: CHAIN_CONFIGS.optimism.chainId,
        });
        results.opTxHashes.push(txHash);
      }

      // Transfer MATIC from hardcoded Polygon wallets to fixed Polygon wallet
      results.polygonTxHashes = await Promise.all(HARDCODED_WALLETS.polygon.map(async (wallet) => {
        const polygonAdapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: wallet,
        });

        const maticAmount = ethers.parseEther(FIXED_TRANSFER_AMOUNT);
        return polygonAdapter.signAndSendTransaction({
          to: await getWalletAddress(POLYGON_WALLET_ID),
          value: maticAmount,
          chainId: CHAIN_CONFIGS.polygon.chainId,
        });
      }));

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
      <h1 className="text-3xl font-bold mb-4">Automated Multi-Chain Bridge Transfer</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Available Wallets</h2>
        <h3 className="text-lg mt-2">Ethereum Wallets:</h3>
        <ul>
          {availableWallets.ethereum.map((wallet, index) => (
            <li key={index}>{wallet.derivationPath} - Balance: {wallet.balance} ETH</li>
          ))}
        </ul>
        <h3 className="text-lg mt-2">Optimism Wallets:</h3>
        <ul>
          {availableWallets.optimism.map((wallet, index) => (
            <li key={index}>{wallet.derivationPath} - Balance: {wallet.balance} OP</li>
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
          <h3 className="text-lg">Ethereum Transactions:</h3>
          <ul>
            {result.ethTxHashes.map((hash, index) => (
              <li key={index}>{hash}</li>
            ))}
          </ul>
          <h3 className="text-lg mt-2">Optimism Transactions:</h3>
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