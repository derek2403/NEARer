import React, { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet

export default function CreateFundPolygonWallet() {
  const [newWallet, setNewWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fundAmount, setFundAmount] = useState('0.01'); // Default fund amount

  const createAndFundWallet = async () => {
    setIsLoading(true);
    setError('');
    setNewWallet(null);

    try {
      // Find the next available derivation path
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

      // Fund the new address
      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
      
      const tx = await wallet.sendTransaction({
        to: newAddress,
        value: ethers.parseEther(fundAmount),
        chainId: POLYGON_CHAIN_ID,
      });
      
      await tx.wait();

      // Get the new balance
      const newBalance = await provider.getBalance(newAddress);

      setNewWallet({
        address: newAddress,
        balance: ethers.formatEther(newBalance),
        derivationPath: `polygon,${index}`,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create and Fund Polygon Wallet</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={fundAmount}
          onChange={(e) => setFundAmount(e.target.value)}
          placeholder="Amount to fund (in MATIC)"
          className="border p-2 mr-2"
        />
        <button
          onClick={createAndFundWallet}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create and Fund Wallet
        </button>
      </div>
      
      {isLoading && <p>Creating and funding wallet...</p>}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {newWallet && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">New Polygon Wallet Created</h2>
          <p>Address: {newWallet.address}</p>
          <p>Balance: {newWallet.balance} MATIC</p>
          <p>Derivation Path: {newWallet.derivationPath}</p>
        </div>
      )}
    </div>
  );
}