# AI-Powered Chain Signature Wallet Management Platform
This project is an all-in-one AI-powered DeFi Chain Signature Wallet Management Platform that integrates NEAR Protocol's Chain Signature. The platform allows users to manage multiple EVM wallets, perform staking, transfer funds, and optimize profits across different blockchains using natural language commands powered by AI. Leveraging Chain Signatures and MPC, the platform allows users to securely manage multiple wallets, execute transactions, and stake assets without exposing private keys to any single point of vulnerability. This ensures a highly secure, decentralized, and efficient wallet management experience, enabling users to take full control over their blockchain assets across multiple chains.

# Features
NEAR Protocol: Use Chain Signatures to manage multiple EVM addresses, send funds, stake, merge wallets, and more.
AI Integration: AI models like OpenAI to provide natural language blockchain interactions.

# How to Use
1. Create Wallets: The CreateWallet component enables users to generate and manage EVM addresses, making use of NEAR’s Chain Signatures to simplify the process.
2. List Wallets: Use the ListWallet component to see all wallets address and their corresponding balances.
3. Stake Funds: With the Staking component, users can find the best staking opportunities across chains, leveraging crypto price data.
4. Transfer Funds: Use the Transfer feature to easily move assets between different EVM addresses.
5. Merge Accounts: The Merge component helps users consolidate funds from multiple wallets into a single account.
6. Maximize Profit: The Max component allows users to optimize profit by automating asset management across different blockchains.

# Workflow Example
1. Add New Wallets
When the user first starts using the platform, the AI will prompt them with a command like:
"Give me an Ethereum address."
The user can respond with their ETH address, and the system will securely record this address using NEAR’s Chain Signatures.
Then, if the user wants to add another wallet address, they can say:
"Add another wallet address,"
and the AI will ask for the new address (it could be from Ethereum, Polygon, Optimism, etc.). The user can provide the address, and the platform will securely record the new address using MPC to split and protect the private key. This ensures that the user's wallet management is highly secure and easy to use.

2. Delete Wallets
If the user wants to delete a wallet, they can simply say:
"Delete my [Ethereum/Polygon/Optimism] wallet."
The platform will ask for confirmation and guide the user through the process of transferring funds to another wallet. The user can choose to consolidate all funds into one wallet before deletion. 

3. Consolidate Funds
The platform allows users to consolidate funds from multiple wallets into a single one.
For example, the user can say:
"Consolidate funds from all my wallets into my main wallet,"
and the system will automatically perform the necessary transactions to transfer funds into the selected wallet. 

4. Bridgeless Bridge (Cross-Chain Asset Transfers)
In addition to wallet management, the platform supports cross-chain transfers through a Bridgeless Bridge. This allows assets to be transferred seamlessly across Ethereum, Polygon, Optimism, and other supported blockchains. The system uses address swapping to perform the transfer without the need for a traditional bridge.
For example, if the user wants to move assets from Ethereum to Polygon, they can say:
"Swap my Ethereum address with my Polygon address and transfer all funds."
The platform will automatically swap the user’s Ethereum address with their Polygon address using NEAR’s Chain Signatures.

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


# Proof of Working
NEAR Chain Signatures: Successfully executed transactions using Chain Signatures on multiple EVM chains:
1. Ethereum: https://sepolia.etherscan.io/address/0xba9a44dc51735b215ad0844fef322afad3a8d99d
2. Polygon: https://amoy.polygonscan.com/address/0x35610c3ca57592096706c89495e607e2a5c03e47
3. Optimism: https://sepolia-optimism.etherscan.io/address/0xdd16d3dc9ded45680af0e88b95ad629303bdb1bf

