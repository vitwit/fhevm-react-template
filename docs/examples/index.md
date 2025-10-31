# Examples

This repository contains example applications demonstrating how to use the `@fhevm/sdk` and related packages across different environments - Node.js, Next.js, and Vue.js.

Each demo uses shared TypeScript definitions and ABIs generated from smart contracts to provide a unified developer experience.

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- Git (for submodules)
- Local blockchain (e.g., Hardhat) or Sepolia testnet access

## Common Setup

Before running any demo, perform the following setup steps:

``` bash
# 1. Install dependencies
pnpm install

# 2. Sync submodules
pnpm fork

# 3. Write and deploy your contracts
pnpm compile # compiles contract
pnpm deploy:localhost   # or deploy:sepolia

# 4. Generate shared ABIs
pnpm generate

# 5. Build core packages
pnpm build:sdk
pnpm build:shared

```

## Node.js Demo

This example shows how to use `@fhevm/sdk` in a backend environment in Node.js applications.

### Location

``` bash
packages/fhevm-node-demo/
```

### Environment Setup

1. Go to the Node.js demo directory.
2. Create a `.env` file with the following fields:

``` 
SEED_PHRASE="your-wallet-seed-phrase-here"
INFURA_API_KEY="your-infura-api-key-here"
```

| 💡 Ensure that the account derived from this SEED_PHRASE has enough tokens (ETH or testnet tokens) to perform transactions.

### Run Locally

After completing the Common Setup:

``` bash
# From the project root
pnpm node-demo:dev
```

This will:
- Initialize the SDK using your .env credentials
- Connect to the network (via Infura)
- Interact with deployed FHE contracts (increment, decrypt, and decrement encrypted counters)

## Next.js Demo

Coming Soon

## Vue.js Demo

Coming Soon