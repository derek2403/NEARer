import React from 'react';
import AutoMultiChainBridgeTransfer from '../pages/bridge';
import AutoMultiChainBridgeTransferEthereum from '../pages/bridgeETH';
import AutoMultiChainBridgeTransferOptimism from '../pages/bridgeOP';

export default function Max({ data }) {
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