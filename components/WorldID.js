"use client";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

const WorldIDLogin = () => {
  const [verified, setVerified] = useState(false);

  // Function to verify proof with the backend server
  const verifyProof = async (proof) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proof, action: "log-in" }),
      });

      if (response.ok) {
        const { verified } = await response.json();
        setVerified(verified);
        if (verified) {
          console.log('Verification successful');
        }
      } else {
        const error = await response.json();
        throw new Error(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Verification failed', error);
    }
  };

  // Success callback after verification
  const onSuccess = () => {
    console.log('Verification succeeded');
    setVerified(true);
  };

  return (
    <IDKitWidget
      app_id="app_staging_b5350534c753a6583385bd6026f89d31"  
      action="log-in"
      verification_level={VerificationLevel.Device}
      handleVerify={verifyProof}
      onSuccess={onSuccess}
    >
      {({ open }) => (
        <button onClick={open}>
          {verified ? "Verified" : "Verify with World ID"}
        </button>
      )}
    </IDKitWidget>
  );
};

export default WorldIDLogin;