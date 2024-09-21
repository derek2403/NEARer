"use client";

import React, { useEffect, useState, forwardRef, useRef } from "react";
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { AnimatedBeam } from "@/components/magicui/animated-beam";

// Circle component with forwardRef
const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

// Polygon Transfer component
const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet

export default function Transfer({ walletId, recipientAddress, amount }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [sourceBalance, setSourceBalance] = useState('');

  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);

  // Function to check the balance of the source wallet
  const checkBalance = async (derivationId) => {
    setIsLoading(true);
    setError('');
    setSourceBalance('');

    try {
      const derivationPath = `polygon,${derivationId}`;
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });

      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const balance = await provider.getBalance(adapter.address);
      setSourceBalance(ethers.formatEther(balance));
    } catch (err) {
      setError(`Error checking balance: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send funds
  const sendFunds = async () => {
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const derivationPath = `polygon,${walletId}`;
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });

      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const amountWei = ethers.parseEther(amount);

      const tx = await adapter.signAndSendTransaction({
        to: recipientAddress,
        value: amountWei,
        chainId: POLYGON_CHAIN_ID,
      });

      setTxHash(tx);

      // Update balance after transaction
      const newBalance = await provider.getBalance(adapter.address);
      setSourceBalance(ethers.formatEther(newBalance));
    } catch (err) {
      setError(`Error sending funds: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check balance and send funds automatically when walletId, recipientAddress, and amount are available
  useEffect(() => {
    if (walletId && recipientAddress && amount) {
      checkBalance(walletId); // Check the balance first
      sendFunds(); // Then automatically send funds
    }
  }, [walletId, recipientAddress, amount]);

  return (
    <div
      className="relative flex w-4/5 m-auto items-center justify-center overflow-hidden   p-10 l"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          {/* Placeholder image in the first circle */}
          <Circle ref={div1Ref}>
            <img
              alt="Exchange Icon"
              className="h-8 w-8"
            />
          </Circle>

          {/* Placeholder image in the second circle */}
          <Circle ref={div2Ref}>
            <img
              src="data:image/png;base64,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" // Replace with your placeholder image path
              alt="Lock Icon"
              className="h-8 w-8"
            />
          </Circle>
        </div>
      </div>

        {/* Animated transfer beam */}
        <AnimatedBeam
          duration={3}
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
        />


      {/* Polygon Transfer Component */}
      <h1 className="text-3xl font-bold mb-4">Send Polygon Funds</h1>

      {sourceBalance && (
        <p className="mb-4">Source Wallet Balance: {sourceBalance} MATIC</p>
      )}

      {isLoading && <p className="mt-4">Processing...</p>}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {txHash && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Transaction Successful</h2>
          <p>Transaction Hash: {txHash}</p>
        </div>
      )}
    </div>
  );
}