// pages/api/chat.js
import 'dotenv/config';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { chatQuery, model } = req.query;

    const queryParams = new URLSearchParams({
      chatQuery: chatQuery,
      model: model,
    }).toString();

    // Append the query parameters to the URL
    const url = `https://wapo-testnet.phala.network/ipfs/Qmc2QJELJLHg6EhDqwEmmht3WayPmh3Jj9FhqazBs6F8jQ?${queryParams}`;
    
    try {
      const agentResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        }
      });

      if (!agentResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await agentResponse.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching from agent:', error);
      res.status(500).json({ error: 'Failed to fetch response from agent' });
    }
  } else {
    res.status(405).json({ message: 'Only GET requests are allowed' });
  }
};