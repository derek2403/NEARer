import React, { useRef, forwardRef } from 'react';
import AutoMultiChainBridgeTransfer from '../pages/bridge';
import AutoMultiChainBridgeTransferEthereum from '../pages/bridgeETH';
import AutoMultiChainBridgeTransferOptimism from '../pages/bridgeOP';
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

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
  key: () => (
    <img
      src="https://cdn-icons-png.freepik.com/256/15299/15299772.png?semt=ais_hybrid"
      alt="key"
      className="w-full h-full object-contain"
    />
  ),
  sc: () => (
    <img
      src="https://cdn-icons-png.flaticon.com/512/7700/7700640.png"
      alt="smart contract"
      className="w-full h-full object-contain"
    />
  ),
  decentralized: () => (
    <img
      src="https://cdn-icons-png.flaticon.com/512/1958/1958764.png"
      alt="decentralized"
      className="w-full h-full object-contain"
    />
  ),
  polygon: () => (
    <img
      src="https://cdn-icons-png.freepik.com/512/12114/12114233.png"
      alt="Polygon"
      className="w-full h-full object-contain"
    />
  ),
  ethereum: () => (
    <img
      src="https://cdn4.iconfinder.com/data/icons/cryptocoins/227/ETH-alt-512.png"
      alt="Ethereum"
      className="w-full h-full object-contain"
    />
  ),
  optimism: () => (
    <img
      src="https://cryptologos.cc/logos/optimism-ethereum-op-logo.png"
      alt="Optimism"
      className="w-full h-full object-contain"
    />
  ),
};

function CreateWallet({ bestChain }) { // Accept bestChain as a prop
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);

  // Function to get dynamic icon based on bestChain
  const getDynamicIcon = () => {
    switch (bestChain) {
      case 'ethereum':
        return <Icons.ethereum />;
      case 'optimism':
        return <Icons.optimism />;
      case 'polygon':
      default:
        return <Icons.polygon />;
    }
  };

  return (
    <div
      className="relative flex h-[400px] w-full items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Icons.sc />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Icons.decentralized />
          </Circle>
          <Circle ref={div4Ref} className="size-16">
            {getDynamicIcon()} {/* Render dynamic icon here */}
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Icons.key />
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
    </div>
  );
}

function Max({ data }) {
  const chainNameMap = {
    'ETH': 'ethereum',
    'OPTIMISM': 'optimism',
    'POLY': 'polygon',
    'POLYGON': 'polygon'
  };

  const bestChain = chainNameMap[data.bestChain.toUpperCase()] || data.bestChain.toLowerCase();

  return (
    <div>
      <p>The best chain to stake based on LSTM model prediction is {bestChain}</p>
      <CreateWallet bestChain={bestChain} /> {/* Pass bestChain as a prop */}
      {(() => {
        switch (bestChain) {
          case 'ethereum':
            return <AutoMultiChainBridgeTransferEthereum />;
          case 'optimism':
            return <AutoMultiChainBridgeTransferOptimism />;
          case 'polygon':
            return <AutoMultiChainBridgeTransfer />;
          default:
            return <p>Unsupported chain: {data.bestChain}</p>;
        }
      })()}
    </div>
  );
}

export default Max;
