# @fhevm/shared

This package contains shared TypeScript definitions and ABIs (Application Binary Interfaces) generated from deployed smart contracts. It provides a unified way to access contract addresses and ABIs across all example applications.

## Overview

The `@fhevm/shared` package automatically exports deployed contract information from the Hardhat sub-repo, making it easy to interact with FHE (Fully Homomorphic Encryption) contracts from any environment - Node.js, Next.js, or Vue.js.

## Workflow

### 1. Write and Deploy Contracts

The project includes a Hardhat sub-repo in the `packages/` directory for smart contract development.
```bash
# Navigate to the Hardhat sub-repo
cd packages/hardhat/

# Write your FHE contract in contracts/
# Example: contracts/FHECounter.sol

# Compile the contract
pnpm compile

# Deploy to your target network
pnpm deploy:localhost   # For local development
# or
pnpm deploy:sepolia     # For Sepolia testnet
```

### 2. Generate Shared ABIs

After deploying your contracts, generate the ABIs from the **root of the project**:
```bash
# Navigate back to project root
cd ../../  # Now at fhevm-react-template/

# Generate shared ABIs
pnpm generate

# Build the shared package
pnpm shared:build
```

The `pnpm generate` command will:
- Read deployed contract information from the Hardhat sub-repo
- Extract contract addresses and ABIs
- Generate TypeScript files in `@fhevm/shared`
- Make them available for import across all packages

## Installation

This package is part of the monorepo and is automatically available to all demo applications after running:
```bash
# From project root (fhevm-react-template/)
pnpm install
pnpm generate  # Generates the shared ABIs from Hardhat deployments
pnpm shared:build
```

## Usage

### Importing Contract Information
```typescript
import { abis } from "@fhevm/shared";

// Access deployed contract on Sepolia (chain ID: 11155111)
const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

console.log(FHECounter.address); // Contract address
console.log(FHECounter.abi);     // Contract ABI
```

### Using with ethers.js
```typescript
import { ethers } from "ethers";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

// Create contract instance
const contract = new ethers.Contract(
  FHECounter.address,
  FHECounter.abi,
  signer
);

// Call contract methods
const count = await contract.getCount();
```

### Chain-Specific Contracts

The package organizes contracts by chain ID:
```typescript
// Sepolia testnet (chain ID: 11155111)
const sepoliaCounter = abis.deployedContracts["11155111"]["FHECounter"];

// Local development (chain ID: 31337)
const localCounter = abis.deployedContracts["31337"]["FHECounter"];

// Access different chains as needed
```

## Contract Structure

### FHECounter

The main example contract demonstrating FHE operations.

#### Address
```typescript
FHECounter.address // "0x2F39E2bfb4d5c8d6e5503F5103C5411Ae583A032"
```

#### ABI Methods

**increment(inputEuint32, inputProof)**
- Increments the encrypted counter
- Parameters:
  - `inputEuint32` (bytes32): Encrypted input value
  - `inputProof` (bytes): Zero-knowledge proof
- Returns: None (state-changing transaction)

**decrement(inputEuint32, inputProof)**
- Decrements the encrypted counter
- Parameters:
  - `inputEuint32` (bytes32): Encrypted input value
  - `inputProof` (bytes): Zero-knowledge proof
- Returns: None (state-changing transaction)

**getCount()**
- Returns the encrypted counter value
- Parameters: None
- Returns: `euint32` (bytes32) - Encrypted counter value

**protocolId()**
- Returns the protocol identifier
- Parameters: None
- Returns: `uint256` - Protocol ID

## Type Safety

The package exports contracts with full TypeScript type safety:
```typescript
import { abis } from "@fhevm/shared";

// TypeScript knows the structure
type DeployedContracts = typeof abis.deployedContracts;
type ChainId = keyof DeployedContracts;
type ContractName = keyof DeployedContracts["11155111"];

// Auto-completion works
const counter = abis.deployedContracts["11155111"]["FHECounter"];
//                                    ^             ^
//                                    |             |
//                              Chain ID      Contract Name
```

## Examples in Different Frameworks

### Node.js
```typescript
import { ethers } from "ethers";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = ethers.Wallet.fromPhrase(process.env.SEED_PHRASE!, provider);
const contract = new ethers.Contract(FHECounter.address, FHECounter.abi, wallet);

// Use contract
const tx = await contract.increment(handles[0], inputProof);
```

### Next.js (React)
```tsx
import { ethers } from "ethers";
import { useFhevm } from "@fhevm/react";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

export default function Component() {
  const { signer } = useFhevm();
  
  const contract = signer 
    ? new ethers.Contract(FHECounter.address, FHECounter.abi, signer)
    : null;
  
  // Use contract
}
```

### Vue.js
```tsx
<script setup lang="ts">
import { ethers } from "ethers";
import { useFhevm } from "@fhevm/vue";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];
const { signer } = useFhevm();

let contract: ethers.Contract | null = null;

watchEffect(() => {
  if (signer.value) {
    contract = new ethers.Contract(FHECounter.address, FHECounter.abi, signer.value);
  }
});
</script>
```

## Complete Development Flow

### Step-by-Step Guide

1. **Write your smart contract**
```bash
   cd packages/hardhat/
   # Edit contracts/YourContract.sol
```

2. **Compile the contract**
```bash
   pnpm compile
```

3. **Deploy to network**
```bash
   pnpm deploy:localhost  # or deploy:sepolia
```

4. **Generate shared ABIs**
```bash
   cd ../../  # Back to fhevm-react-template/
   pnpm generate
```

5. **Build shared package**
```bash
   pnpm shared:build
```

6. **Use in your application**
```typescript
   import { abis } from "@fhevm/shared";
   const MyContract = abis.deployedContracts["CHAIN_ID"]["YourContract"];
```

## Package Structure
```
@fhevm/shared/
├── src/
│   ├── contracts/
│   │   └── deployedContracts.ts  # Auto-generated from Hardhat deployments
│   └── index.ts                  # Package exports
├── package.json
└── tsconfig.json
```

## Generated File Structure

The `deployedContracts.ts` file is auto-generated and follows this structure:
```typescript
/**
 * Auto-generated file.
 * Contains deployed contracts with address and ABI.
 */
export const deployedContracts = {
  "CHAIN_ID": {
    ContractName: {
      address: "0x...",
      abi: [
        // ABI array
      ],
    },
  },
} as const;
```

## Adding New Contracts

When you deploy new contracts:

1. **Write and deploy** your contract in the Hardhat sub-repo
```bash
   cd packages/hardhat/
   pnpm compile
   pnpm deploy:sepolia
```

2. **Generate ABIs** from project root
```bash
   cd ../../  # fhevm-react-template/
   pnpm generate
```

3. **Build shared package**
```bash
   pnpm shared:build
```

4. **Use the new contract**
```typescript
   import { abis } from "@fhevm/shared";
   const NewContract = abis.deployedContracts["CHAIN_ID"]["YourNewContract"];
```

## Important Notes

- **Always run `pnpm generate` from the project root** (`fhevm-react-template/`), not from the Hardhat sub-repo 
- The Hardhat sub-repo must be properly initialized with `pnpm fork` before generating ABIs
- All contract data is exported as `const` for immutability
- ABIs are automatically typed for TypeScript
- The package is designed to be tree-shakeable
- Contract addresses are network-specific (identified by chain ID)
- Always rebuild the shared package after generating new ABIs
- The generated files should not be manually edited as they will be overwritten

## Troubleshooting

**ABIs not updating after deployment**
```bash
# Make sure you're at project root
cd fhevm-react-template/
pnpm generate
pnpm shared:build
```

**Contract not found after generation**
- Verify the contract was successfully deployed in the Hardhat sub-repo
- Check the deployment output for the correct chain ID
- Ensure `pnpm generate` completed without errors

**TypeScript errors when importing**
```bash
# Rebuild the shared package
pnpm shared:build
```