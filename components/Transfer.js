"use client";

import React, { useEffect, useState } from "react";
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { Input, Progress } from "@nextui-org/react";

// Polygon Transfer component
const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet

export default function Transfer({ walletId = "1", recipientAddress = "0xRecipientAddress", amount = "0.01" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [sourceBalance, setSourceBalance] = useState('');

  // Function to check the balance of the source wallet
  const checkBalance = async (derivationId) => {
    setIsLoading(true);
    setProgressValue(10); // Set initial progress for balance check
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
      setProgressValue(30); // Update progress after balance is fetched
    } catch (err) {
      setError(`Error checking balance: ${err.message}`);
      setProgressValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send funds
  const sendFunds = async () => {
    setIsLoading(true);
    setProgressValue(40); // Set progress for sending transaction
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
      setProgressValue(70); // Update progress after successful transaction

      // Update balance after transaction
      const newBalance = await provider.getBalance(adapter.address);
      setSourceBalance(ethers.formatEther(newBalance));
      setProgressValue(100); // Complete progress
    } catch (err) {
      setProgressValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger balance check and fund transfer automatically on component mount
  useEffect(() => {
    if (walletId && recipientAddress && amount) {
      checkBalance(walletId); // Check balance
      sendFunds(); // Automatically send funds
    }
  }, [walletId, recipientAddress, amount]);

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Send Polygon Funds</h1>

      {/* View-only form for recipient address and amount */}
      <form className="space-y-4">
        <Input
          label="Recipient Address"
          value={recipientAddress}
          isDisabled
          className="max-w-xs"
        />
        <Input
          label="Amount"
          value={amount}
          isDisabled
          className="max-w-xs"
        />
      </form>

      {/* Show loading progress */}
      {isLoading && (
        <div className="mt-6">
          <Progress aria-label="Loading..." value={progressValue} className="max-w-md" />
        </div>
      )}

      {/* Display error message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Display success and transaction hash */}
      {txHash && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Transaction Successful</h2>
          <p>Transaction Hash: {txHash}</p>
        </div>
      )}

      {/* Display source wallet balance */}
      {sourceBalance && (
        <p className="mt-6">Source Wallet Balance: {sourceBalance} MATIC</p>
      )}
    </div>
  );
}