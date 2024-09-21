import React, { useState } from 'react';
import CreateWallet from '../components/CreateWallet';
import ListWallet from '../components/ListWallet';
import Staking from '../components/Staking';
import Transfer from '../components/Transfer';
import Header from '@/components/Header';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to parse the user prompt for transfer details
  const parseTransferPrompt = (prompt) => {
    const regex = /transfer (\d+(\.\d+)?) matic to (\b0x[a-fA-F0-9]{40}\b) using polygon (\d+)/i;
    const match = prompt.match(regex);

    if (match) {
      const amount = match[1]; // Extracted amount of MATIC
      const recipientAddress = match[3]; // Extracted recipient address
      const walletId = match[4]; // Extracted wallet ID

      return { amount, recipientAddress, walletId };
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setLoading(true);

    // Log the user input (prompt)
    console.log('User prompt:', userInput);

    try {
      const res = await fetch(`/api/chat?chatQuery=${encodeURIComponent(userInput)}&model=gpt-4o`, {
        method: 'GET',
      });

      const data = await res.json();

      // If the response has a 'body' field (from your test script), parse it
      let agentDataResponse;

      if (data.body) {
        agentDataResponse = JSON.parse(data.body);
      } else {
        agentDataResponse = data;
      }

      // Console log the index and parameters
      console.log('Index:', agentDataResponse.index);
      console.log('Parameters:', agentDataResponse);

      // If transfer (index 3), parse the input for transfer details
      if (agentDataResponse.index === 3) {
        const parsedData = parseTransferPrompt(userInput);
        if (parsedData) {
          agentDataResponse = { ...agentDataResponse, ...parsedData };
        } else {
          agentDataResponse = { message: 'Sorry, I could not understand your transfer request.', index: -1 };
        }
      }

      setAgentData(agentDataResponse);
      setUserInput('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setAgentData({ message: 'Error fetching response from agent.', index: -1 });
    } finally {
      setLoading(false);
    }
  };

  const renderAgentResponse = (agentData) => {
    if (!agentData) {
      return (
        <img
          src="https://via.placeholder.com/150"
          alt="Default Response"
          className="mx-auto my-4"
        />
      );
    }

    const { index } = agentData;

    switch (index) {
      case 5: // Staking
        return <Staking data={agentData} />;
      case 2: // List wallets
        return <ListWallet data={agentData} />;
      case 3: // Transfer funds
        return (
          <Transfer
            walletId={agentData.walletId}
            recipientAddress={agentData.recipientAddress}
            amount={agentData.amount}
          />
        );
      case 4: // Create account
        return <CreateWallet data={agentData} />;
      case 1: // Other cases
        return <Max data={agentData} />;
      default:
        return <p>{agentData.message}</p>;
    }
  };

  return (
    <div className="w-4/5 mx-auto h-4/5" style={{ Height: '100vh' }}>
      <Header/>
      <div className="border border-gray-200 shadow-lg rounded-xl p-6 min-h-[300px]  overflow-y-auto mb-6 w-full bg-white" style={{ height: '60vh' }}>
        {loading && <p className="text-gray-500 text-center">Loading...</p>}
        {!agentData && (
          <img
            src="https://via.placeholder.com/150"
            alt="Default Response"
            className="mx-auto my-4"
          />
        )}
        {agentData && (
          <div className="mb-4 text-center">
            {renderAgentResponse(agentData)}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex w-full mx-auto shadow-md rounded-lg bg-white" style={{ height: 'auto' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your query..."
          required
          className="flex-1 p-4 text-gray-900 border-0 rounded-l-lg focus:outline-none"
          style={{ fontSize: '16px', background: '#f7f7f7', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-4 rounded-r-lg hover:bg-blue-700 transition-all"
          style={{ fontSize: '16px', fontWeight: '500', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;