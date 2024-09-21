import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Spinner } from "@nextui-org/react";

const CHAIN_CONFIGS = [
  {
    name: 'Ethereum',
    prefix: 'ethereum',
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    explorerUrl: 'https://sepolia.etherscan.io/address/',
  },
  {
    name: 'Polygon',
    prefix: 'polygon',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    symbol: 'MATIC',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    explorerUrl: 'https://amoy.polygonscan.com/',
  },
  {
    name: 'Optimism',
    prefix: 'optimism',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    explorerUrl: 'https://sepolia-optimism.etherscan.io/address/',
  },
];

export default function ListWallet() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const truncateAddress = (address) => {
    return `${address.slice(0, 30)}...`;
  };
  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(10);
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Chain Signatures Wallet Address</h1>

      {isLoading && (
       <div className="flex justify-center items-center h-full">
            <Spinner color="primary" labelColor="primary" />
          </div>
      )}

      {error && (
        <p className="text-red-500 mt-4">Error: {error}</p>
      )}

      {!isLoading && !error && wallets.length === 0 && (
        <p className="text-gray-500 mt-4">No wallets with a balance were found.</p>
      )}

      {wallets.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet, index) => {
            const chainConfig = CHAIN_CONFIGS.find(config => config.name === wallet.chain);
            return (
              <Card key={`${wallet.chain}-${wallet.address}-${index}`} className="max-w-[400px]">
                <CardHeader className="flex gap-3">
                  <Image
                    alt={`${wallet.chain} logo`}
                    height={40}
                    radius="sm"
                    src={chainConfig.logo}
                    width={40}
                  />
                  <div className="flex flex-col">
                    <p className="text-md">{wallet.chain}</p>
                    <p className="text-small text-default-500">{`${wallet.chain.toLowerCase()},${wallet.derivationPath.split(',')[1]}`}</p>
                  </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                  <p>Address: {truncateAddress(wallet.address)}</p>
                  <p>Balance: {formatBalance(wallet.balance)} {wallet.symbol}</p>
                </CardBody>
                <Divider/>
                <CardFooter>
                  <Link
                    isExternal
                    showAnchorIcon
                    href={`${chainConfig.explorerUrl}${wallet.address}`}
                  >
                    View on {wallet.chain} Testnet Explorer
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}