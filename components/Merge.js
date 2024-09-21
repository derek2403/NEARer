import React, { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { Accordion, AccordionItem, Spinner, Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@nextui-org/react'; // Import components

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
  const [showConsolidatedWallet, setShowConsolidatedWallet] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !isLoading) {
      setTimeout(() => {
        setShowConsolidatedWallet(true);
        consolidateFunds();
      }, 5000); // 5 seconds delay
    }
  }, [wallets, isLoading]);

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

      if (newWallets.length < 2) {
        setError('Not enough wallets to consolidate funds.');
      }
    } catch (err) {
      setError(`Error fetching wallets: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const consolidateFunds = async () => {
    console.log('Consolidation process started...');
    if (wallets.length < 2) {
      console.log('Not enough wallets to consolidate funds.');
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

          console.log(`From: ${wallet.address}, To: ${targetWallet.address}, Amount: ${ethers.formatEther(amountToSend)} MATIC, Tx Hash: ${tx}`);
        } else {
          console.log(`From: ${wallet.address}, To: ${targetWallet.address}, Amount: 0 MATIC, Insufficient balance after gas costs.`);
        }
      }

      console.log('Consolidation process finished.');
    } catch (err) {
      console.error(`Error consolidating funds: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Consolidate Wallets</h1>

      {/* Only show this message while loading the wallets */}
      {isLoading && (
        <div className="flex items-center justify-center">
          <Spinner label="Loading..." color="default" />
        </div>
      )}

      {/* Show the Polygon Wallets first, but hide them completely after 5 seconds */}
      {!showConsolidatedWallet && wallets.length > 0 && !isLoading && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Available Wallets</h2>

          {/* Accordion for Wallets */}
          <Accordion>
            {wallets.map((wallet, index) => (
              <AccordionItem key={index} title={`Address ${index + 1}: ${wallet.address}`}>
                <div className="p-2">
                  <p>Balance: {wallet.balance} MATIC</p>
                  <p className="text-sm text-gray-500">Derivation Path: {wallet.derivationPath}</p>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {/* Show the hardcoded consolidated wallet only when the wallets are fetched and after 5 seconds */}
      {showConsolidatedWallet && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Consolidated Wallet</h2>

          {/* Card for consolidated wallet */}
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Image
                alt="wallet logo"
                height={40}
                radius="sm"
                src="https://cryptologos.cc/logos/polygon-matic-logo.png" // Placeholder image
                width={40}
              />
              <div className="flex flex-col">
                <p className="text-md">Polygon Consolidated Wallet</p>
                <p className="text-small text-default-500">polygon.org</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p>Address: 0x665e8a463ecc7151125bb3bf8c039819f2a67fcf</p> {/* Hardcoded address */}
              <p>Consolidated Balance: 0.058203049999643 MATIC</p> {/* Hardcoded balance */}
              <p className="text-sm text-gray-500">Path: polygon,1</p> {/* Hardcoded path */}
            </CardBody>
            <Divider />
            <CardFooter>
              <Link
                isExternal
                showAnchorIcon
                href="https://polygonscan.com" // Placeholder explorer link
              >
                View on Polygon Explorer
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}