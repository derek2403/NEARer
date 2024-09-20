import React, { useState } from 'react';
import CreateWallet from '../components/CreateWallet';
import ListWallet from '../components/ListWallet';
import Staking from '../components/Staking';
import Transfer from '../components/Transfer';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const { index } = agentData;

    switch (index) {
      case 1: // Staking
        return <Staking data={agentData} />;
      case 2: // List wallets
        return <ListWallet data={agentData} />;
      case 3: // Transfer funds
        return <Transfer data={agentData} />;
      case 4: // Create account
        return <CreateWallet data={agentData} />;
      default:
        return <p>{agentData.message}</p>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with the Agent</h1>
      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto mb-4">
        {loading && <p className="text-gray-500">Loading...</p>}
        {agentData && (
          <div className="mb-4">
            {renderAgentResponse(agentData)}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your query..."
          required
          className="flex-1 p-2 border border-gray-300 rounded-l-lg"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;