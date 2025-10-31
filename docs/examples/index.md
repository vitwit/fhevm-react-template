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

This example demonstrates how to build a fully homomorphic encrypted (FHE) counter application using Next.js and the FHEVM React SDK. The counter value is stored encrypted on-chain and can only be decrypted by authorized users.

### Location
``` bash
packages/fhevm-next-demo/
```

### Environment Setup

1. Go to the Next.js demo directory.
2. Create a `.env.local` file with the following fields:
```
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...
```

| 💡 Ensure that MetaMask is installed and connected, and your wallet has enough tokens (ETH or testnet tokens) to perform transactions.

### Run Locally

After completing the Common Setup:
``` bash
# From the project root
pnpm next-demo:dev

# Open http://localhost:3000
```

This will:
- Initialize the FHEVM React SDK with your environment configuration
- Connect to MetaMask wallet
- Interact with deployed FHE contracts (increment, decrypt, and decrement encrypted counters)
- Display the encrypted counter in a web interface

### Overview

The example showcases:
- Setting up FHEVM in a Next.js application
- Encrypting data before sending to smart contracts
- Decrypting encrypted values from contracts
- Managing wallet connection and SDK initialization

### Project Structure
```
fhevm-next-demo/
├── src/app/
│   ├── layout.tsx       # Root layout with FhevmProvider
│   └── page.tsx         # Counter component
├── .env.local           # Environment variables
└── package.json
```

### Root Layout

Wrap your application with `FhevmProvider` in `layout.tsx`:
```tsx
"use client";

import React from "react";
import { FhevmProvider } from "@fhevm/react";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif",}}>
        <FhevmProvider
          network="testnet"
          rpcUrl={process.env.NEXT_PUBLIC_RPC_URL!}
          contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!}
          chainId={11155111} // Sepolia
        >
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}

```

**Key Points:**
- Use `"use client"` directive for client-side rendering
- Pass network configuration through environment variables
- Provider handles wallet connection and SDK initialization

### Counter Component

#### Initialize Contract and SDK
```tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@fhevm/react";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

export default function HomePage() {
  const { sdk, signer, address, initialized, loading } = useFhevm();
  const [counter, setCounter] = useState(null);
  const [busy, setBusy] = useState(false);

  // Create contract instance
  const contract = signer 
    ? new ethers.Contract(FHECounter.address, FHECounter.abi, signer) 
    : null;
```

#### Reading Encrypted Values
```tsx
    const getCounter = async () => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    try {
      const encryptedValue = await contract.getCount();
      const decrypted = await sdk.decrypt([encryptedValue], address, [FHECounter.address]);
      setCounter(Number(decrypted.plaintext[encryptedValue]));
    } catch (err) {
      console.error("Failed to get counter:", err);
    } finally {
      setBusy(false);
    }
  };
```

**Steps:**
1. Call contract method to get encrypted value
2. Generate public key and EIP-712 signature for authorization
3. Decrypt the value using the SDK
4. Update state with decrypted result

#### Writing Encrypted Values
```tsx
  const changeCounter = async (method: "increment" | "decrement") => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    try {
      const { handles, inputProof } = await sdk.encryptInputs(address, [
        { type: "u32", value: 1 },
      ]);
      const tx = await contract[method](handles[0], inputProof);
      await tx.wait();
      await getCounter();
    } catch (err) {
      console.error(`${method} failed:`, err);
    } finally {
      setBusy(false);
    }
  };
```

**Steps:**
1. Encrypt the input value (1 in this case) using `encryptInputs`
2. Submit the encrypted handles and proof to the contract
3. Wait for transaction confirmation
4. Refresh the counter to show updated value

#### Auto-fetch on Mount
```tsx
  useEffect(() => {
    if (initialized && sdk && contract && address) {
      getCounter();
    }
  }, [initialized]);
```

Automatically fetch the counter value once the SDK is initialized.

#### UI Rendering
```tsx
 
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-400 bg-neutral-950">
        🔌 Connecting to MetaMask...
      </div>
    );

  if (!initialized)
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-400 bg-neutral-950">
        ⚙️ Initializing FHE SDK...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-gray-100 px-4">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight">
        Encrypted Counter
      </h1>
      <p className="text-sm text-gray-500 mb-10 font-mono">
        Connected: <span className="text-blue-400">{address}</span>
      </p>

      <div className="flex flex-col items-center space-y-8">
        <div className="text-7xl sm:text-8xl font-bold text-white tracking-tight">
          {counter === null ? "…" : counter}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => changeCounter("decrement")}
            disabled={busy}
            className="px-6 py-2 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            ➖ Decrement
          </button>

          <button
            onClick={() => changeCounter("increment")}
            disabled={busy}
            className="px-6 py-2 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            ➕ Increment
          </button>
        </div>

        <button
          onClick={getCounter}
          disabled={busy}
          className="mt-4 px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          🔄 Refresh
        </button>

        {busy && (
          <p className="text-gray-400 animate-pulse text-sm">⏳ Please wait…</p>
        )}
      </div>

      <footer className="mt-16 text-xs text-gray-600">
        Built with ❤️ using <span className="text-blue-400 font-medium">Zama FHEVM</span>
      </footer>
    </div>
  );
}

```

**UI States:**
- Loading: Shows while connecting to MetaMask
- Initializing: Shows while FHEVM SDK is setting up
- Ready: Shows counter with increment/decrement buttons
- Busy: Disables buttons during operations

### Complete Flow

#### Incrementing the Counter

1. User clicks "Increment" button
2. SDK encrypts the value `1` as `u32`
3. Encrypted handles and proof sent to `contract.increment()`
4. Transaction is mined on-chain
5. Counter is automatically refreshed
6. Decrypted value displayed to user

#### Reading the Counter

1. User clicks "Refresh" button (or on initial load)
2. Contract returns encrypted counter value
3. SDK generates signature for decryption authorization
4. SDK decrypts the value
5. Decrypted number displayed in UI

### Key Concepts

#### Encryption
```typescript
const { handles, inputProof } = await sdk.encryptInputs(address, [
  { type: "u32", value: 1 },
]);
```

- `handles`: Encrypted ciphertext to send to contract
- `inputProof`: Zero-knowledge proof for verification
- All computation happens on encrypted data

#### Decryption
```typescript
const decrypted = await sdk.decrypt([encryptedValue], address, sig);
```

- Requires user signature for authorization
- Only authorized addresses can decrypt
- Values remain encrypted on-chain

### Common Issues

**"SDK not initialized"**
- Wait for `initialized` to be `true` before operations
- Check that MetaMask is connected

**Decryption fails**
- Ensure user has permission to decrypt the value
- Verify signature is created correctly

**Transaction reverts**
- Check that encrypted data format matches contract expectations
- Verify inputProof is included in transaction

## Vue.js Demo


This example demonstrates how to build a fully homomorphic encrypted (FHE) counter application using Vue.js and the FHEVM Vue plugin. The counter value is stored encrypted on-chain and can only be decrypted by authorized users.

### Location
``` bash
packages/fhevm-vue-demo/
```

### Environment Setup

1. Go to the Vue.js demo directory.
2. Update the `main.ts` file with your configuration:
```typescript
app.use(FhevmPlugin, {
  network: "testnet",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  contractAddress: "0xYourFHECounterAddress",
  chainId: 11155111,
});
```

| 💡 Ensure that MetaMask is installed and connected, and your wallet has enough tokens (ETH or testnet tokens) to perform transactions.

### Run Locally

After completing the Common Setup:
``` bash
# From the project root
pnpm vue-demo:dev

# Open http://localhost:5173
```

This will:
- Initialize the FHEVM Vue plugin with your configuration
- Connect to MetaMask wallet
- Interact with deployed FHE contracts (increment, decrypt, and decrement encrypted counters)
- Display the encrypted counter in a web interface

### Overview

The example showcases:
- Setting up FHEVM in a Vue.js application
- Encrypting data before sending to smart contracts
- Decrypting encrypted values from contracts
- Managing wallet connection and SDK initialization with Vue composables

### Project Structure
```
fhevm-vue-demo/
├── src/
│   ├── App.vue              # Root component
│   ├── components/
│   │   └── Counter.vue      # Counter component
│   ├── main.ts              # App initialization with FhevmPlugin
│   └── assets/
│       ├── base.css
│       └── main.css
├── public/
│   └── favicon.ico
└── package.json
```

### Plugin Setup

Register the `FhevmPlugin` in `main.ts`:
```typescript
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.css";
import "./assets/main.css";

import { FhevmPlugin } from "@fhevm/vue";

const app = createApp(App);

// Example Sepolia config
app.use(FhevmPlugin, {
  network: "testnet",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  contractAddress: "0xYourFHECounterAddress",
  chainId: 11155111,
});

app.mount("#app");
```

**Key Points:**
- Plugin must be registered before mounting the app
- Pass network configuration directly to the plugin
- Plugin handles wallet connection and SDK initialization globally

### Root Component

Create the main `App.vue`:
```vue
<template>
  <div class="container">
    <h1>🔐 Encrypted Counter (Vue)</h1>
    <Counter />
  </div>
</template>

<script setup lang="ts">
import Counter from "./components/Counter.vue";
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
}
</style>
```

### Counter Component

#### Component Setup
```vue
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { ethers } from "ethers";
import { useFhevm, useEncrypt } from "@fhevm/vue";
import { abis } from "@fhevm/shared";

const { sdk, signer, address, loading } = useFhevm();
const { encrypt } = useEncrypt();

const counter = ref<number | null>(null);
const busy = ref(false);

// Example FHE Counter ABI
const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];
let contract: ethers.Contract | null = null;

watchEffect(() => {
  if (signer.value) {
    contract = new ethers.Contract(FHECounter.address, FHECounter.abi, signer.value);
  }
});
```

**Key Points:**
- Use `useFhevm()` composable to access SDK, signer, and wallet address
- Use `useEncrypt()` composable for encryption utilities
- Watch for signer changes to create contract instance reactively

#### Reading Encrypted Values
```typescript
async function getCounter() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const encrypted = await contract.getCount();
    const pk = await sdk.value.getPublicKey();
    const sig = await sdk.value.createEIP712(pk);
    const decrypted = await sdk.value.decrypt([encrypted], address.value, sig);
    counter.value = Number(decrypted.plaintext);
  } catch (err) {
    console.error("getCounter failed", err);
  } finally {
    busy.value = false;
  }
}
```

**Steps:**
1. Call contract method to get encrypted value
2. Generate public key and EIP-712 signature for authorization
3. Decrypt the value using the SDK
4. Update reactive ref with decrypted result

#### Writing Encrypted Values
```typescript
async function increment() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const { handles, inputProof } = await encrypt([{ type: "u32", value: 1 }]);
    const tx = await contract.increment(handles[0], inputProof);
    await tx.wait();
    await getCounter();
  } catch (err) {
    console.error("increment failed", err);
  } finally {
    busy.value = false;
  }
}

async function decrement() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const { handles, inputProof } = await encrypt([{ type: "u32", value: 1 }]);
    const tx = await contract.decrement(handles[0], inputProof);
    await tx.wait();
    await getCounter();
  } catch (err) {
    console.error("decrement failed", err);
  } finally {
    busy.value = false;
  }
}
```

**Steps:**
1. Encrypt the input value (1 in this case) using `encrypt` composable
2. Submit the encrypted handles and proof to the contract
3. Wait for transaction confirmation
4. Refresh the counter to show updated value

#### Template and UI
```vue
<template>
  <div>
    <p v-if="loading">🕓 Connecting wallet...</p>

    <div v-else>
      <p>Connected: {{ address }}</p>
      <h2>{{ counter ?? "…" }}</h2>

      <div class="buttons">
        <button @click="decrement" :disabled="busy">➖ Decrement</button>
        <button @click="increment" :disabled="busy">➕ Increment</button>
      </div>

      <div class="buttons">
        <button @click="getCounter" :disabled="busy">🔄 Refresh</button>
      </div>

      <p v-if="busy">⏳ Please wait…</p>
    </div>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}
</style>
```

**UI States:**
- Loading: Shows while connecting to MetaMask
- Connected: Shows wallet address and counter with action buttons
- Busy: Disables buttons during operations

### Complete Flow

#### Incrementing the Counter

1. User clicks "Increment" button
2. `encrypt` composable encrypts the value `1` as `u32`
3. Encrypted handles and proof sent to `contract.increment()`
4. Transaction is mined on-chain
5. Counter is automatically refreshed
6. Decrypted value displayed to user

#### Reading the Counter

1. User clicks "Refresh" button
2. Contract returns encrypted counter value
3. SDK generates signature for decryption authorization
4. SDK decrypts the value
5. Decrypted number displayed in reactive UI

### Key Concepts

#### Vue Composables
```typescript
const { sdk, signer, address, loading } = useFhevm();
const { encrypt } = useEncrypt();
```

- `useFhevm()`: Provides reactive access to SDK instance, signer, wallet address, and loading state
- `useEncrypt()`: Provides encryption utilities with proper context
- All values are reactive refs that update automatically

#### Encryption
```typescript
const { handles, inputProof } = await encrypt([{ type: "u32", value: 1 }]);
```

- `handles`: Encrypted ciphertext to send to contract
- `inputProof`: Zero-knowledge proof for verification
- All computation happens on encrypted data

#### Decryption
```typescript
const pk = await sdk.value.getPublicKey();
const sig = await sdk.value.createEIP712(pk);
const decrypted = await sdk.value.decrypt([encrypted], address.value, sig);
```

- Requires user signature for authorization
- Only authorized addresses can decrypt
- Values remain encrypted on-chain

### Common Issues

**"SDK not initialized"**
- Ensure the plugin is registered in `main.ts` before mounting
- Check that MetaMask is connected and unlocked

**Decryption fails**
- Ensure user has permission to decrypt the value
- Verify signature is created correctly

**Transaction reverts**
- Check that encrypted data format matches contract expectations
- Verify inputProof is included in transaction

**Reactive values not updating**
- Always access composable values with `.value` (e.g., `sdk.value`, `address.value`)
- Use `watchEffect` or `watch` for reactive contract instance creation