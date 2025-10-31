# @fhevm/react

React integration layer for the Fully Homomorphic Encryption Virtual Machine (FHEVM).
This package provides React hooks and context to easily integrate encryption, decryption, and FHE-enabled contract interactions in your dApp.

## Features

- One-line initialization using <FhevmProvider />
- Seamless encryption and decryption with `useEncrypt` and `useDecrypt`
- Auto MetaMask connection and network switching
- Works with `@fhevm/sdk` under the hood
- Compatible with ethers for contract interaction

## Installation

``` bash
yarn add @fhevm/react
# or
npm install @fhevm/react

```

## Quick Start

Wrap your app in the `FhevmProvider`:

``` tsx
import { FhevmProvider } from "@fhevm/react";

export default function App() {
  return (
    <FhevmProvider
      rpcUrl="https://sepolia.infura.io/v3/<INFURA_KEY>"
      contractAddress="0xYourContractAddress"
    >
      <YourComponent />
    </FhevmProvider>
  );
}
```

## Hooks Overview

### 1. `useFhevm()`

Provides access to the initialized FHEVM SDK, signer, provider, and account details.

``` tsx
import { useFhevm } from "@fhevm/react";

function WalletInfo() {
  const { address, loading, initialized } = useFhevm();

  if (loading) return <p>Connecting...</p>;
  return <p>Connected: {initialized ? address : "Not initialized"}</p>;
}
```

#### Exposed values

| Key           | Description                     |
| ------------- | ------------------------------- |
| `sdk`         | Instance of `FhevmUniversalSDK` |
| `provider`    | `ethers.Provider` instance      |
| `signer`      | Connected wallet signer         |
| `address`     | Active wallet address           |
| `loading`     | Initialization state            |
| `initialized` | SDK initialization status       |
| `initError`   | Initialization error (if any)   |

### 2. `useEncrypt()`

Encrypt multiple values into ciphertexts and generate an input proof.
Useful before calling encrypted smart contract functions.

``` ts
import { useEncrypt } from "@fhevm/react";

const { encrypt, loading } = useEncrypt();

const handleEncrypt = async () => {
  const inputs = [
    { type: "u32", value: 123 },
    { type: "bool", value: true },
  ];

  const result = await encrypt(inputs);
  console.log(result);
};
```

**Returns:**

``` ts
{
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

```

### 3. `useDecrypt()`

Decrypt ciphertexts returned from the blockchain using the user’s stored signature.
Automatically handles signature caching and re-generation when needed.

``` ts
import { useDecrypt } from "@fhevm/react";

const { decrypt, loading } = useDecrypt();

const handleDecrypt = async (ciphertexts: string[]) => {
  const result = await decrypt(ciphertexts);
  console.log("Decrypted result:", result);
};
```

## Build Configuration (Important for Frontend)

Some frontend frameworks may require minor adjustments to handle dynamic imports or Node.js core modules used inside `@fhevm/sdk`.

### Next.js Example

Add a fallback in your `next.config.ts` (or `next.config.js`) to prevent module resolution issues like Can't resolve 'fs':

``` ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
```

### Vite Example

f you’re using `Vite` (e.g., React or Vue projects), you can add a similar fallback in your `vite.config.ts`:

``` ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      fs: false,
    },
  },
});

```

## Example Workflow

- Initialize provider → `FhevmProvider`
- Encrypt inputs → `useEncrypt`
- Call encrypted contract method
- Fetch ciphertext result
- Decrypt using → `useDecrypt`

## Context Overview

`<FhevmProvider />`

Automatically:

- Connects MetaMask
- Ensures correct network (switch/add chain if needed)
- Initializes the FHEVM SDK using @fhevm/sdk
- Provides access to context values via useFhevm()


| Prop              | Type                                 | Description                              |
| ----------------- | ------------------------------------ | ---------------------------------------- |
| `rpcUrl`          | `string`                             | RPC endpoint                             |
| `contractAddress` | `string`                             | Address of deployed FHE-enabled contract |
| `chainId`         | `number`                             | (optional) Ethereum chain ID             |
| `children`        | `ReactNode`                          | Wrapped application content              |
