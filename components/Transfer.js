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
    <div className="container mx-auto p-4">
      {/* UI Component on top */}
      <div
        className="relative flex w-4/5 m-auto items-center justify-center overflow-hidden p-10"
        ref={containerRef}
      >
        <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
          <div className="flex flex-row justify-between">
            {/* Placeholder image in the first circle */}
            <Circle ref={div1Ref}>
              <img
                src="/path/to/placeholder.png" // Replace with your placeholder image path
                alt="User Icon"
                className="h-8 w-8"
              />
            </Circle>

            {/* Placeholder image in the second circle */}
            <Circle ref={div2Ref}>
              <img
                src="/path/to/placeholder.png" // Replace with your placeholder image path
                alt="OpenAI Icon"
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
      </div>

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