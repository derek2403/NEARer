import React, { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet

export default function SendPolygonFunds() {
  const [derivationId, setDerivationId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [sourceBalance, setSourceBalance] = useState('');

  const checkBalance = async () => {
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

  const sendFunds = async () => {
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const derivationPath = `polygon,${derivationId}`;
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Send Polygon Funds</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2" htmlFor="derivationId">
          Wallet ID (e.g., 1 for polygon,1):
        </label>
        <input
          id="derivationId"
          type="text"
          value={derivationId}
          onChange={(e) => setDerivationId(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter wallet ID"
        />
      </div>

      <button
        onClick={checkBalance}
        disabled={isLoading || !derivationId}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Check Balance
      </button>

      {sourceBalance && (
        <p className="mb-4">Source Wallet Balance: {sourceBalance} MATIC</p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2" htmlFor="recipientAddress">
          Recipient Address:
        </label>
        <input
          id="recipientAddress"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter recipient address"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2" htmlFor="amount">
          Amount (MATIC):
        </label>
        <input
          id="amount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter amount to send"
        />
      </div>

      <button
        onClick={sendFunds}
        disabled={isLoading || !derivationId || !recipientAddress || !amount}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Send Funds
      </button>

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