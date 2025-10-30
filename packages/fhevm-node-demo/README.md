# 🔐 FHEVM Node Demo

This package demonstrates how to interact with **Fully Homomorphic Encryption (FHE)** smart contracts using the [`@fhevm/sdk`] library and **Ethers.js** in a Node.js environment.

It connects to the **Sepolia testnet**, reads contract data, encrypts/decrypts inputs using the FHE SDK, and performs contract calls such as `increment()`, `decrement()`, and `getCount()`.

---

## 🛠️ Prerequisites

- **Node.js** ≥ 20
- **pnpm** package manager
- A **Sepolia** RPC endpoint (e.g., [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/))
- A valid **Ethereum seed phrase** (mnemonic) with test ETH on Sepolia

---

## ⚙️ Installation

From the repository root:

```bash
pnpm install
```

Then navigate to this package:

```
cd packages/fhevm-node-demo
```

## 🔑 Environment Setup

Create a `.env` file inside `packages/fhevm-node-demo/`:

```
SEED_PHRASE="pencil unaware toddler tackle add detect ... (your seed)"
INFURA_API_KEY="your_infura_project_id"
```

|
⚠️ Do not commit your .env file!
Ensure .env is included in .gitignore to protect your private keys.
|

## 🚀 Running the Demo

```
npm run dev
```