# AI-Powered DeFi Platform
This project is an all-in-one AI-powered DeFi platform that integrates NEAR Protocol's Chain Signatures, Pyth Network's price feeds, Phala Network's Red Pill contract, and WorldID. The platform allows users to manage multiple EVM wallets, perform staking, transfer funds, and optimize profits across different blockchains using natural language commands powered by AI.

# Features
NEAR Protocol: Use Chain Signatures to manage multiple EVM addresses, send funds, stake, merge wallets, and more.
AI Integration: Phala Network's Red Pill contract connects to AI models like OpenAI to provide natural language blockchain interactions.
Pyth Network: Real-time and historical price data powers our machine learning model for identifying the best staking opportunities.
WorldID: Prevent abuse with privacy-preserving proof of personhood.

# Installation
1. git clone https://github.com/derek2403/eth.git
2. cd eth
3. npm install
4. npm run dev

# Project Structure
agent/: Contains all integrations with Phala Network and Pyth Network.
components/worldid.js: Manages WorldID integration for identity verification.
pages/:
CreateWallet.js: Handles wallet creation using NEAR Protocol’s Chain Signatures.
ListWallet.js: Displays all derived wallets and their balances.
Staking.js: Automates staking across chains with the highest APY using Pyth Network price data.
Transfer.js: Allows users to transfer funds between EVM addresses.
Merge.js: Merges funds from multiple wallets on the same chain.
Header.js: The navigation header for the application.
Max.js: Maximizes profits by optimizing asset distribution across chains and staking platforms.

# How to Use
1. Create Wallets: The CreateWallet component enables users to generate and manage EVM addresses, making use of NEAR’s Chain Signatures to simplify the process.
2. List Wallets: Use the ListWallet component to see all wallets and their corresponding balances.
3. Stake Funds: With the Staking component, users can find the best staking opportunities across chains, leveraging Pyth’s price data.
4. Transfer Funds: Use the Transfer feature to easily move assets between different EVM addresses.
5. Merge Accounts: The Merge component helps users consolidate funds from multiple wallets into a single account.
6. Maximize Profit: The Max component allows users to optimize profit by automating asset management across different blockchains.

# Proof of Working
WorldID: Verified on app_staging_b5350534c753a6583385bd6026f89d31

NEAR Chain Signatures: Successfully executed transactions using Chain Signatures on multiple EVM chains:
1. Ethereum: https://sepolia.etherscan.io/address/0xba9a44dc51735b215ad0844fef322afad3a8d99d
2. Polygon: https://amoy.polygonscan.com/address/0x35610c3ca57592096706c89495e607e2a5c03e47
3. Optimism: https://sepolia-optimism.etherscan.io/address/0xdd16d3dc9ded45680af0e88b95ad629303bdb1bf

Phala Network: Proof of AI execution and model deployment:
{
  "date": "2024-09-21T04:59:39.312Z",
  "cid": "Qmc2QJELJLHg6EhDqwEmmht3WayPmh3Jj9FhqazBs6F8jQ",
  "url": "https://wapo-testnet.phala.network/ipfs/Qmc2QJELJLHg6EhDqwEmmht3WayPmh3Jj9FhqazBs6F8jQ"
}

