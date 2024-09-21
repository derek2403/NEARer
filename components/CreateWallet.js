"use client";

import React, { useState, useEffect, forwardRef, useRef } from "react";
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

// Circle component with forwardRef
const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

const Icons = {
  notion: () => <img src="/" alt="Notion" className="w-full h-full object-contain" />,
  openai: () => <img src="https://logowik.com/content/uploads/images/polygon-matic-icon3725.logowik.com.webp" alt="OpenAI" className="w-full h-full object-contain" />,
  whatsapp: () => <img src="/api/placeholder/100/100" alt="WhatsApp" className="w-full h-full object-contain" />,
  messenger: () => <img src="/api/placeholder/100/100" alt="Messenger" className="w-full h-full object-contain" />,
};

// Configuration for Polygon Network
const POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
const POLYGON_CHAIN_ID = 80002; // Mumbai testnet

export default function CreateWallet() {
  const [newWallet, setNewWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  // Function to create and fund the wallet
  useEffect(() => {
    const createAndFundWallet = async () => {
      setIsLoading(true);
      setError('');
      setNewWallet(null);

      try {
        let index = 1;
        let newAddress = null;

        // Find the next available derivation path
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
          value: ethers.parseEther('0.01'), // Fund 0.01 MATIC
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

    // Trigger the creation of the wallet when the component is mounted
    createAndFundWallet();
  }, []);

  return (
    <div>
      <div
        className="relative flex h-[400px] w-full items-center justify-center overflow-hidden  p-10 "
        ref={containerRef}
      >
        <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div1Ref}>
              <Icons.notion />
            </Circle>
            <Circle ref={div5Ref}>
              <Icons.messenger />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div2Ref}>
              <Icons.notion />
            </Circle>
            <Circle ref={div4Ref} className="size-16">
              <Icons.openai />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div3Ref}>
              <Icons.whatsapp />
            </Circle>
            <Circle ref={div7Ref}>
              <Icons.messenger />
            </Circle>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div4Ref}
          curvature={-75}
          endYOffset={-10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div4Ref}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div4Ref}
          curvature={75}
          endYOffset={10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div5Ref}
          toRef={div4Ref}
          curvature={-75}
          endYOffset={-10}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div6Ref}
          toRef={div4Ref}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div7Ref}
          toRef={div4Ref}
          curvature={75}
          endYOffset={10}
          reverse
        />
      </div>

      {/* Automatically create and display Polygon wallet under the UI */}
      <div className="container mx-auto p-4">
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
    </div>
  );
}