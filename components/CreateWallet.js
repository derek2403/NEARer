import React, { useState, useEffect } from 'react';
import { CircularProgress, Link, Card, CardHeader, CardBody, CardFooter, Divider, Image } from '@nextui-org/react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet
const chainConfig = {
  explorerUrl: 'https://amoy.polygonscan.com/',
  chain: 'Polygon', // Optional, add more properties as needed
};

export default function CreateWallet() {
  const [newWallet, setNewWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0); // Progress for CircularProgress
  const [error, setError] = useState('');
  const fundAmount = '0.01'; // Default fund amount is hardcoded now

  const createAndFundWallet = async () => {
    setIsLoading(true);
    setProgressValue(0); // Reset progress to 0
    setError('');
    setNewWallet(null);

    try {
      // Step 1: Find the next available derivation path
      setProgressValue(10); // Update progress
      let index = 1;
      let newAddress = null;
      while (!newAddress) {
        const derivationPath = `polygon,${index}`;
        const adapter = await setupAdapter({
          accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
          privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          derivationPath: derivationPath,
        });

        const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
        const balance = await provider.getBalance(adapter.address);

        if (balance === BigInt(0)) {
          newAddress = adapter.address;
        } else {
          index++;
        }
      }

      setProgressValue(40); // Update progress

      // Step 2: Fund the new address
      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);

      const tx = await wallet.sendTransaction({
        to: newAddress,
        value: ethers.parseEther(fundAmount),
        chainId: POLYGON_CHAIN_ID,
      });

      await tx.wait();

      setProgressValue(80); // Update progress

      // Step 3: Get the new balance
      const newBalance = await provider.getBalance(newAddress);

      setNewWallet({
        address: newAddress,
        balance: ethers.formatEther(newBalance),
        derivationPath: `polygon,${index}`,
      });

      setProgressValue(100); // Complete progress

    } catch (err) {
      setError(err.message);
      setProgressValue(0); // Reset progress on error
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger wallet creation automatically when the component is mounted
  useEffect(() => {
    createAndFundWallet();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Create and Fund Wallet</h1>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <p className="mb-4">Loading...</p>
          <CircularProgress
            aria-label="Loading..."
            size="xl" // Make the loader bigger
            value={progressValue}
            color="warning"
            showValueLabel={true}
          />
        </div>
      )}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {newWallet && (
        <div className="flex justify-center mt-8">
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Image
                alt="Polygon logo"
                height={40}
                radius="sm"
                src="https://cryptologos.cc/logos/polygon-matic-logo.png"
                width={40}
              />
              <div className="flex flex-col">
                <p className="text-md">Polygon Wallet</p>
                <p className="text-small text-default-500">polygon.org</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p><strong>Address:</strong> {newWallet.address}</p>
              <p><strong>Balance:</strong> {newWallet.balance} MATIC</p>
              <p><strong>Derivation Path:</strong> {newWallet.derivationPath}</p>
            </CardBody>
            <Divider />
            <CardFooter>
              <Link
                isExternal
                showAnchorIcon
                href={`${chainConfig.explorerUrl}address/${newWallet.address}`}
              >
                View on Polygon Testnet Explorer
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}