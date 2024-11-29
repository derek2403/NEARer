# AI-Powered DeFi Platform
This project is an all-in-one AI-powered DeFi platform that integrates NEAR Protocol's Chain Signature. The platform allows users to manage multiple EVM wallets, perform staking, transfer funds, and optimize profits across different blockchains using natural language commands powered by AI.

# Features
NEAR Protocol: Use Chain Signatures to manage multiple EVM addresses, send funds, stake, merge wallets, and more.
AI Integration: AI models like OpenAI to provide natural language blockchain interactions.


# Installation
1. git clone https://github.com/derek2403/eth.git
2. cd eth
3. npm install
4. npm run dev

# Project Structure
agent/: Contains all integrations with OpenAI agents.
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
3. Stake Funds: With the Staking component, users can find the best staking opportunities across chains, leveraging crypto price data.
4. Transfer Funds: Use the Transfer feature to easily move assets between different EVM addresses.
5. Merge Accounts: The Merge component helps users consolidate funds from multiple wallets into a single account.
6. Maximize Profit: The Max component allows users to optimize profit by automating asset management across different blockchains.

# Proof of Working
NEAR Chain Signatures: Successfully executed transactions using Chain Signatures on multiple EVM chains:
1. Ethereum: https://sepolia.etherscan.io/address/0xba9a44dc51735b215ad0844fef322afad3a8d99d
2. Polygon: https://amoy.polygonscan.com/address/0x35610c3ca57592096706c89495e607e2a5c03e47
3. Optimism: https://sepolia-optimism.etherscan.io/address/0xdd16d3dc9ded45680af0e88b95ad629303bdb1bf

