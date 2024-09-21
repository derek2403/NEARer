import React, { useState, useRef } from 'react';
import { Spinner } from "@nextui-org/react";
import CreateWallet from '../components/CreateWallet';
import ListWallet from '../components/ListWallet';
import Staking from '../components/Staking';
import Transfer from '../components/Transfer';
import Merge from '../components/Merge';
import Header from '@/components/Header';
import Max from '@/components/Max';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

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

  // Function to check if the prompt contains the word 'merge'
  const checkForMerge = (prompt) => {
    return prompt.toLowerCase().includes('merge');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setLoading(true);
    setAgentData(null); // Reset agentData when starting a new request

    console.log('User prompt:', userInput);

    try {
      let agentDataResponse = {};
      
      if (checkForMerge(userInput)) {
        agentDataResponse.index = 6;
      } else {
        const res = await fetch(`/api/chat?chatQuery=${encodeURIComponent(userInput)}&model=gpt-4o`, {
          method: 'GET',
        });

        const data = await res.json();
        agentDataResponse = data.body ? JSON.parse(data.body) : data;

        console.log('Index:', agentDataResponse.index);
        console.log('Parameters:', agentDataResponse);

        if (agentDataResponse.index === 3) {
          const parsedData = parseTransferPrompt(userInput);
          if (parsedData) {
            agentDataResponse = { ...agentDataResponse, ...parsedData };
          } else {
            agentDataResponse = { message: 'Sorry, I could not understand your transfer request.', index: -1 };
          }
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
    if (!agentData) return null;

    const { index } = agentData;

    switch (index) {
      case 5: return <Staking data={agentData} />;
      case 2: return <ListWallet data={agentData} />;
      case 3: return (
        <Transfer
          walletId={agentData.walletId}
          recipientAddress={agentData.recipientAddress}
          amount={agentData.amount}
        />
      );
      case 4: return <CreateWallet data={agentData} />;
      case 6: return <Merge data={agentData} />;
      case 1: return (
        <div className="flex flex-col h-full">
          <div className="flex-grow flex justify-center items-start pt-8">
            <Max data={agentData} />
          </div>
          <div className="h-20"></div> {/* Space for additional text */}
        </div>
      );
      default: return <p>{agentData.message}</p>;
    }
  };

  return (
    <div className="w-4/5 mx-auto h-4/5" style={{ height: '100vh' }}>
      <Header/>
      <div ref={containerRef} className="border border-gray-200 shadow-lg rounded-xl p-6 min-h-[300px] overflow-y-auto mb-6 w-full bg-white" style={{ height: '60vh' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : agentData ? (
          <div className="h-full">
            {renderAgentResponse(agentData)}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            <img
              src="/LOGO2.jpeg"
              alt="Default Response"
              className="w-1/2 mx-auto mb-4" // Adjust width to your preference
            />
            <h1 className="text-center font-bold">I'm your AI Agent. How can I help?</h1>
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