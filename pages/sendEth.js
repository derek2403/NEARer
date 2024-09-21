import { useState } from 'react';
import { setupAdapter } from 'near-ca';


const SEPOLIA_CHAIN_ID = 11155111;

export default function EthManager() {
  const [ethAddress, setEthAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [derivationPath, setDerivationPath] = useState('ethereum,1');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');

  const generateAddress = async () => {
    setIsLoading(true);
    setError('');
    try {
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });

      setEthAddress(adapter.address);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFunds = async () => {
    setIsLoading(true);
    setError('');
    setTxHash('');
    try {
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });
  
      // Convert amount from ETH to wei
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
  
      const hash = await adapter.signAndSendTransaction({
        to: recipientAddress,
        value: amountInWei,
        chainId: SEPOLIA_CHAIN_ID,
      });
  
      setTxHash(hash);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Ethereum Address Manager</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="derivationPath" style={{ display: 'block', marginBottom: '5px' }}>Derivation Path:</label>
        <input
          type="text"
          id="derivationPath"
          value={derivationPath}
          onChange={(e) => setDerivationPath(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <button 
        onClick={generateAddress} 
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Ethereum Address'}
      </button>

      {ethAddress && (
        <div>
          <p style={{ marginTop: '20px' }}>Your Ethereum address: {ethAddress}</p>
          
          <h2>Send Funds</h2>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="recipientAddress" style={{ display: 'block', marginBottom: '5px' }}>Recipient Address:</label>
            <input
              type="text"
              id="recipientAddress"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>Amount (in ETH):</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <button 
            onClick={sendFunds} 
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Sending...' : 'Send Funds'}
          </button>
        </div>
      )}

      {txHash && (
        <p style={{ marginTop: '20px' }}>Transaction Hash: {txHash}</p>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>
      )}
    </div>
  );
}