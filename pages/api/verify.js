// pages/api/verifyProof.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { proof, action } = req.body;
  
      try {
        const response = await fetch('https://developer.worldcoin.org/api/v1/verify/app_staging_b5350534c753a6583385bd6026f89d31', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...proof, action }),
        });
  
        if (response.ok) {
          const { verified } = await response.json();
          
          // If verified, redirect to /chat
          if (verified) {
            return res.redirect(302, '/chat');
          } else {
            return res.status(400).json({ verified: false, message: 'Verification failed' });
          }
        } else {
          const error = await response.json();
          return res.status(400).json({ code: error.code, detail: error.detail });
        }
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}