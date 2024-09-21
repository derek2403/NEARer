import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Input } from "@nextui-org/react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { cn } from "@/lib/utils";
import PulsatingButton from "@/components/magicui/pulsating-button";
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

const Circle = React.forwardRef(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white p-1 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
      className
    )}
  >
    {children}
  </div>
));

const INITIAL_CHAIN_CONFIGS = [
  {
    name: 'Ethereum',
    prefix: 'ethereum',
    chainId: 11155111,
    APY: '~4% - 5.5%',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/2iPF_MT9jp-O4mQ0eWd1HpeamV3zWWt4',
    stakingPoolName: 'Lido Finance',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    explorerUrl: 'https://sepolia.etherscan.io/address/',
    stakingContract: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    stakingLogo: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png',
  },
  {
    name: 'Polygon',
    prefix: 'polygon',
    APY: '~8% - 10%',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    stakingPoolName: 'Stader Labs',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    explorerUrl: 'https://amoy.polygonscan.com/address',
    stakingContract: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
    stakingLogo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSswL9D7l311MOcRLJYTMaHkzrf4dIvx2bunw&s',
  },
  {
    name: 'Optimism',
    prefix: 'optimism',
    APY: '~30% - 60%',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    stakingPoolName: 'Synthetix (SNX) Staking',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    explorerUrl: 'https://sepolia-optimism.etherscan.io/',
    stakingContract: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
    stakingLogo: 'https://i.ytimg.com/vi/6ZO5aYg1GI8/sddefault.jpg',

  },
];

export default function ComprehensiveMultiChainStaking() {
  const [chainConfigs, setChainConfigs] = useState(INITIAL_CHAIN_CONFIGS);
  const [isStaking, setIsStaking] = useState(false);
  const [activeChains, setActiveChains] = useState([false, false, false]);
  const [error, setError] = useState('');
  const [stakingStatus, setStakingStatus] = useState('');
  const containerRef = useRef(null);
  const chainRefs = useRef(chainConfigs.map(() => React.createRef()));
  const smartContractRefs = useRef(chainConfigs.map(() => React.createRef()));

  const handleContractAddressChange = (index, value) => {
    const newConfigs = [...chainConfigs];
    newConfigs[index].stakingContract = value;
    setChainConfigs(newConfigs);
  };

  const executeStaking = async () => {
    setIsStaking(true);
    setError('');
    setStakingStatus('');
    setActiveChains([true, true, true]);

    try {
      for (const chain of chainConfigs) {
        let index = 1;
        let hasBalance = true;

        while (hasBalance) {
          const derivationPath = `${chain.prefix},${index}`;
          const adapter = await setupAdapter({
            accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
            privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
            mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
            derivationPath: derivationPath,
          });

          const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
          const balance = await provider.getBalance(adapter.address);

          if (balance > BigInt(0)) {
            await stakeForAddress(chain, adapter, balance);
            index++;
          } else {
            hasBalance = false;
          }
        }
      }
      setStakingStatus(prevStatus => `${prevStatus}\nStaking completed on all chains.`);
    } catch (err) {
      setError(`Error during staking process: ${err.message}`);
    } finally {
      setIsStaking(false);
      setActiveChains([false, false, false]);
    }
  };

  const stakeForAddress = async (chain, adapter, balance) => {
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const gasPrice = await provider.getFeeData();
    const gasLimit = 100000; // Increased gas limit for staking transaction
    const gasCost = gasPrice.gasPrice * BigInt(gasLimit);

    const amountToStake = balance - gasCost;

    if (amountToStake > 0) {
      try {
        const tx = await adapter.signAndSendTransaction({
          to: chain.stakingContract,
          value: amountToStake,
          chainId: chain.chainId,
          gasLimit: gasLimit,
          gasPrice: gasPrice.gasPrice,
        });
        console.log(`Staked ${ethers.formatEther(amountToStake)} on ${chain.name}. TX: ${tx}`);
        setStakingStatus(prevStatus => `${prevStatus}\nStaked ${ethers.formatEther(amountToStake)} on ${chain.name}. TX: ${tx}`);
      } catch (err) {
        throw new Error(`Failed to stake on ${chain.name}: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="relative flex w-full max-w-[500px] flex-col items-start justify-between overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl" ref={containerRef}>
        {chainConfigs.map((chain, index) => (
          <div key={chain.name} className="flex w-full items-center justify-between mb-4">
            <Circle ref={chainRefs.current[index]}>
              <img src={chain.logo} alt={`${chain.name} Icon`} className="h-6 w-6 object-contain" />
            </Circle>
            <Circle ref={smartContractRefs.current[index]}>
              <img src={chain.stakingLogo} alt={`${chain.stakingPoolName} Icon`} className="h-6 w-6 object-contain" />
            </Circle>
            <AnimatedBeam
              duration={1}
              containerRef={containerRef}
              fromRef={smartContractRefs.current[index]}
              toRef={chainRefs.current[index]}
              pathColor={!isStaking ? "gray" : "blue"}
              pathOpacity={!isStaking ? 0.8 : 0.2}
              animate={!isStaking}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[900px]">
        {chainConfigs.map((chain, index) => (
          <Card key={chain.name} className="max-w-[300px]">
            <CardHeader className="flex gap-3">
              <Image
                alt={`${chain.name} logo`}
                height={40}
                radius="sm"
                src={chain.logo}
                width={40}
              />
              <div className="flex flex-col">
                <p className="text-md">{chain.name}</p>
                <p className="text-small text-default-500">Staking Contract</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-small mt-2">Name: {chain.stakingPoolName}</p>
              <p className="text-small">Estimated APY: {chain.APY}</p>
            </CardBody>
            <Divider />
            <CardFooter>
              <Link
                isExternal
                showAnchorIcon
                href={`${chain.explorerUrl}${chain.stakingContract}`}
              >
                View on Explorer
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PulsatingButton
        onClick={executeStaking}
        disabled={isStaking}
        className="mt-8 px-8 py-2 text-lg"
      >
        {isStaking ? 'Staking in progress...' : 'Confirm and Start Staking'}
      </PulsatingButton>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {stakingStatus && (
        <div className="mt-8 w-full max-w-[500px]">
          <h2 className="text-2xl font-semibold mb-4">Staking Status:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{stakingStatus}</pre>
        </div>
      )}
    </div>
  );
}