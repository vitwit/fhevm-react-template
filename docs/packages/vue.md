# Vue

Vue 3 integration for the Fully Homomorphic Encryption Virtual Machine (FHEVM).
This package provides Vue composables and a plugin for managing encryption, decryption, and SDK setup within Vue applications.


## Features

- Simple setup via FhevmPlugin
- Reactive encryption/decryption composables (useEncrypt, useDecrypt)
- Automatic MetaMask connection and network switching
- Works with `@fhevm/sdk` under the hood
- Fully type-safe and reactive using Vue ref

## Installation

``` bash
yarn add @fhevm/vue
# or
npm install @fhevm/vue

```

## Quick Start

### 1. Register the plugin

In your `main.ts`

``` ts
import { createApp } from "vue";
import App from "./App.vue";
import { FhevmPlugin } from "@fhevm/vue";

const app = createApp(App);

app.use(FhevmPlugin, {
  network: "testnet",
  rpcUrl: "https://sepolia.infura.io/v3/<INFURA_KEY>",
  contractAddress: "0xYourContractAddress",
});

app.mount("#app");

```

### 2. Use inside components

All FHEVM composables (useFhevm, useEncrypt, useDecrypt) are now available anywhere inside your app.

Example:

``` ts
<script setup lang="ts">
import { useEncrypt, useDecrypt } from "@fhevm/vue";
import { ref } from "vue";

const { encrypt } = useEncrypt();
const { decrypt } = useDecrypt();

const encryptedData = ref<any>(null);
const decryptedData = ref<any>(null);

const handleEncrypt = async () => {
  const result = await encrypt([{ type: "u32", value: 42 }]);
  encryptedData.value = result;
};

const handleDecrypt = async () => {
  if (!encryptedData.value) return;
  const result = await decrypt([encryptedData.value]);
  decryptedData.value = result;
};
</script>

<template>
  <div>
    <button @click="handleEncrypt">Encrypt</button>
    <button @click="handleDecrypt" :disabled="!encryptedData">Decrypt</button>

    <div v-if="decryptedData">Decrypted: {{ decryptedData }}</div>
  </div>
</template>

```

## Composables Overview

### 1. `useFhevm()`

Access the core FHEVM context - including SDK, provider, signer, wallet address, and contract details.

``` ts
import { useFhevm } from "@fhevm/vue";

const { sdk, address, initialized, loading } = useFhevm();

```

**Reactive properties:**

| Key               | Type                             | Description                     |
| ----------------- | -------------------------------- | ------------------------------- |
| `sdk`             | `Ref<FhevmUniversalSDK \| null>` | Initialized SDK instance        |
| `provider`        | `Ref<ethers.Provider \| null>`   | Ethers provider                 |
| `signer`          | `Ref<ethers.Signer \| null>`     | Connected signer                |
| `address`         | `Ref<string \| null>`            | Active wallet address           |
| `contractAddress` | `Ref<string \| null>`            | Contract used for FHE ops       |
| `loading`         | `Ref<boolean>`                   | Connection/initialization state |
| `initialized`     | `Ref<boolean>`                   | SDK ready status                |

### 2. `useEncrypt()`

Encrypt one or more plaintext values into ciphertexts for use in FHE-enabled smart contracts.

``` ts
import { useEncrypt } from "@fhevm/vue";

const { encrypt } = useEncrypt();

const result = await encrypt([
  { type: "u32", value: 100 },
  { type: "bool", value: true },
]);

```

**Returns:**

``` ts
{
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

```

### 3. `useDecrypt()`

Decrypt ciphertexts returned from the blockchain using the connected wallet’s stored keypair.
Automatically manages signature generation and caching.

``` ts
import { useDecrypt } from "@fhevm/vue";

const { decrypt, loading, error } = useDecrypt();

const result = await decrypt(["0xEncryptedValue"]);

```

|
🧠 Note:
Use decrypt() only for ciphertexts that are decryptable by the user’s private key.
For ciphertexts marked publicly decryptable in your smart contract, use the SDK’s publicDecrypt() instead.

## Build Configuration (Important for Frontend)

Some frontend frameworks may require minor adjustments to handle dynamic imports or Node.js core modules used inside `@fhevm/sdk`.

If you’re using `Vite` (e.g., React or Vue projects), you can add a similar fallback in your `vite.config.ts`:

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

- Install and configure plugin (FhevmPlugin)
- Use `useEncrypt()` to encrypt input data
- Send ciphertexts to your contract
- Retrieve ciphertext response
- Use `useDecrypt()` to decrypt results locally