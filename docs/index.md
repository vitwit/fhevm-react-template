# FHEVM Universal SDK

A unified monorepo for building decentralized applications powered by Fully Homomorphic Encryption (FHE) using the FHEVM (Fully Homomorphic Encryption Virtual Machine).
It includes SDKs, shared contract artifacts, and example apps across multiple frameworks - all demonstrating private computation on encrypted blockchain data.

## 🚀 What is FHEVM?

FHEVM extends Ethereum to support computation directly on encrypted data, enabling true on-chain privacy.
With FHEVM, smart contracts can operate on ciphertexts without ever decrypting them - preserving user confidentiality while maintaining public verifiability.

This SDK simplifies integrating FHEVM into React, Vue, Node.js, or Next.js environments.

## ✨ Features

- **Universal SDK** - A single SDK that works across multiple environments, including React, Node.js, Next.js, and Vue.
- **FHEVM Integration** - Provides native support for Fully Homomorphic Encryption (FHE) smart contracts.
- **@fhevm/shared Package** - Contains common TypeScript types, ABIs, and utility functions shared across all framework packages.
- **Modular Architecture** - Each framework (React, Node.js, Next.js, Vue) is organized as a separate package for clean isolation and easier maintenance.
- **Hardhat Template** - Includes a preconfigured Hardhat setup based on the fhevm-hardhat-template for writing and deploying FHE contracts.
- **Cross-Framework Examples** - Provides reference implementations for:
   - Node.js (backend interaction)
   - React (frontend interaction)
   - Next.js (full-stack example)
   - Vue (frontend interaction)

   
## 🧰 Monorepo Structure

```
fhevm-universal-sdk/
|
├── docs/                     # Vitepress docs
├── packages/
│   ├── fhevm-sdk/            # Core SDK (encryption, decryption, FHEVM tools)
│   ├── fhevm-react/          # React hooks + providers
│   ├── fhevm-node-demo/      # Node.js demo using FHEVM contracts
│   ├── fhevm-vue-demo/       # Vue demo app
│   ├── fhevm-next-demo/      # Next.js demo app
│   ├── fhevm-shared/         # Shared contracts, ABIs, types
│   └── hardhat/              # Contract deployment & Hardhat environment
└── scripts/
    └── generateAbis.ts       # Generates shared ABI JSON from compiled contracts

```

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Git** for cloning the repository
- **Infura / Alchemy key** (for testnet RPCs)

## ⚙️ Setup & Installation

### 1. Clone and initialize

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Initialize submodules (includes fhevm-hardhat-template)
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### 2. Write Your Smart Contracts

Once the submodules are synced, go to the contracts directory and write or modify your own FHE smart contracts (e.g. `FHECounter.sol`).

### 3. Environment Configuration

Set up your Hardhat environment variables by following the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional):

- `MNEMONIC`: Your wallet mnemonic phrase
- `INFURA_API_KEY`: Your Infura API key for Sepolia

### 3. Start Development Environment

**Option A: Local Development (Recommended for testing)**

```bash
# Terminal 1: Start local Hardhat node
pnpm chain
# RPC URL: http://127.0.0.1:8545 | Chain ID: 31337

# Terminal 2: Deploy contracts to localhost
pnpm deploy:localhost

# Terminal 3: Start the frontend
pnpm start
```

**Option B: Sepolia Testnet**

```bash
# Deploy to Sepolia testnet
pnpm deploy:sepolia

# Start the frontend
pnpm start
```

### 4. Generate Shared ABI

Once deployment is successful, generate the shared ABI file that both your backend (Node) and frontend (React) will use.

``` bash
pnpm generate
```

This will produce a JSON file (e.g. `abis.json`) in the shared directory:

``` json
{
  "deployedContracts": {
    "11155111": {
      "FHECounter": {
        "address": "0xYourContractAddress",
        "abi": [ ... ]
      }
    }
  }
}

```

### 5. Connect MetaMask

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Connect Wallet" and select MetaMask
3. If using localhost, add the Hardhat network to MetaMask:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`


## 🔧 Troubleshooting

### Common MetaMask + Hardhat Issues

When developing with MetaMask and Hardhat, you may encounter these common issues:

#### ❌ Nonce Mismatch Error

**Problem**: MetaMask tracks transaction nonces, but when you restart Hardhat, the node resets while MetaMask doesn't update its tracking.

**Solution**:
1. Open MetaMask extension
2. Select the Hardhat network
3. Go to **Settings** → **Advanced**
4. Click **"Clear Activity Tab"** (red button)
5. This resets MetaMask's nonce tracking

#### ❌ Cached View Function Results

**Problem**: MetaMask caches smart contract view function results. After restarting Hardhat, you may see outdated data.

**Solution**:
1. **Restart your entire browser** (not just refresh the page)
2. MetaMask's cache is stored in extension memory and requires a full browser restart to clear

> 💡 **Pro Tip**: Always restart your browser after restarting Hardhat to avoid cache issues.

For more details, see the [MetaMask development guide](https://docs.metamask.io/wallet/how-to/run-devnet/).
