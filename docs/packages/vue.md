# Vue

The `@fhevm-sdk/vue` package provides Vue 3 composables and a plugin for seamless FHEVM integration in Vue applications. It handles wallet connection, SDK initialization, and provides reactive composables for encryption and decryption operations.

## Overview

This package wraps the core FHEVM SDK with Vue-specific utilities:

- **FhevmPlugin**: Vue plugin for managing SDK state and wallet connection
- **useFhevm**: Composable to access SDK instance and connection state
- **useEncrypt**: Composable for encrypting data
- **useDecrypt**: Composable for decrypting data

## Setup

### FhevmPlugin

Register the `FhevmPlugin` in your Vue app to initialize the FHEVM SDK and manage wallet connections.

```typescript
import { createApp } from 'vue';
import { FhevmPlugin } from '@fhevm-sdk/vue';
import App from './App.vue';

const app = createApp(App);

app.use(FhevmPlugin, {
  network: 'testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  contractAddress: '0x1234...',
  chainId: 11155111
});

app.mount('#app');
```

**Options:**

- `network`: Network type - `"devnet"`, `"testnet"`, or `"mainnet"`
- `rpcUrl`: RPC endpoint URL for the network
- `contractAddress`: FHEVM contract address to interact with
- `chainId`: (Optional) Network chain ID, defaults to `11155111` (Sepolia)

**Features:**

- Automatically detects and connects to MetaMask
- Prompts network switching if user is on wrong chain
- Initializes FHEVM SDK with connected wallet
- Provides reactive state across all components

## Composables

### useFhevm

Access the FHEVM SDK instance and connection state.

```vue
<script setup lang="ts">
import { useFhevm } from '@fhevm-sdk/vue';

const { sdk, provider, signer, address, loading, initialized } = useFhevm();
</script>

<template>
  <div>
    <div v-if="loading">Connecting wallet...</div>
    <div v-else-if="!initialized">Initializing FHEVM...</div>
    <div v-else>Connected: {{ address }}</div>
  </div>
</template>
```

**Returns:**

- `sdk`: Ref containing FhevmUniversalSDK instance (null if not initialized)
- `provider`: Ref containing Ethers.js provider
- `signer`: Ref containing Ethers.js signer
- `address`: Ref containing connected wallet address
- `loading`: Ref indicating if MetaMask connection is in progress
- `initialized`: Ref indicating if FHEVM SDK is ready

### useEncrypt

Encrypt data for FHEVM smart contracts.

```vue
<script setup lang="ts">
import { useEncrypt } from '@fhevm-sdk/vue';
import { ref } from 'vue';

const { encrypt } = useEncrypt();
const encrypting = ref(false);

const handleEncrypt = async () => {
  encrypting.value = true;
  try {
    const result = await encrypt([
      { type: 'u32', value: 42 },
      { type: 'bool', value: true }
    ]);

    // Use result.handles and result.inputProof in contract call
    await contract.submitEncrypted(result.handles, result.inputProof);
  } catch (error) {
    console.error('Encryption failed:', error);
  } finally {
    encrypting.value = false;
  }
};
</script>

<template>
  <button @click="handleEncrypt" :disabled="encrypting">
    {{ encrypting ? 'Encrypting...' : 'Encrypt' }}
  </button>
</template>
```

**Returns:**

- `encrypt(inputs)`: Function to encrypt data
  - `inputs`: Single `EncryptionInput` or array (max 10 items)
  - Returns: `{ handles, inputProof }`
  - Throws: Error if SDK not initialized or encryption fails

**Input Types:**

```typescript
type EncryptionInput = 
  | { type: 'bool', value: boolean }
  | { type: 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'u256', value: number | bigint }
  | { type: 'address', value: string };
```

**Single or Multiple Inputs:**

```typescript
// Single input
const result = await encrypt({ type: 'u32', value: 42 });

// Multiple inputs
const result = await encrypt([
  { type: 'u32', value: 42 },
  { type: 'bool', value: true }
]);
```

### useDecrypt

Decrypt encrypted values from FHEVM contracts.

```vue
<script setup lang="ts">
import { useDecrypt } from '@fhevm-sdk/vue';
import { ref } from 'vue';

const { decrypt } = useDecrypt();
const decrypting = ref(false);
const value = ref(null);

const handleDecrypt = async (encrypted: any, signature: string) => {
  decrypting.value = true;
  try {
    const decrypted = await decrypt(encrypted, signature);
    value.value = decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
  } finally {
    decrypting.value = false;
  }
};
</script>

<template>
  <div>
    <button @click="handleDecrypt(ciphertext, sig)" :disabled="decrypting">
      {{ decrypting ? 'Decrypting...' : 'Decrypt' }}
    </button>
    <p v-if="value">Decrypted: {{ value }}</p>
  </div>
</template>
```

**Returns:**

- `decrypt(encrypted, signature)`: Function to decrypt data
  - `encrypted`: Encrypted value from contract
  - `signature`: EIP-712 signature for authorization
  - Returns: Decrypted value
  - Throws: Error if SDK not initialized or decryption fails

**Note:** You need to create an EIP-712 signature before decrypting. Use the SDK directly:

```typescript
const { sdk } = useFhevm();
const publicKey = await sdk.value.getPublicKey();
const signature = await sdk.value.createEIP712(publicKey);
```

## Complete Example

```vue
<script setup lang="ts">
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk/vue';
import { ref, computed } from 'vue';
import { ethers } from 'ethers';

const { sdk, initialized, address, signer } = useFhevm();
const { encrypt } = useEncrypt();
const { decrypt } = useDecrypt();

const count = ref<number | null>(null);
const encrypting = ref(false);
const decrypting = ref(false);

const contractAddress = '0x1234...';
const abi = [...]; // Your contract ABI

const contract = computed(() => {
  if (!signer.value) return null;
  return new ethers.Contract(contractAddress, abi, signer.value);
});

const incrementCounter = async () => {
  if (!contract.value) return;
  
  encrypting.value = true;
  try {
    // Encrypt the increment value
    const encrypted = await encrypt({ type: 'u32', value: 1 });
    
    // Call contract
    const tx = await contract.value.increment(
      encrypted.handles[0], 
      encrypted.inputProof
    );
    await tx.wait();
  } catch (error) {
    console.error('Increment failed:', error);
  } finally {
    encrypting.value = false;
  }
};

const getCount = async () => {
  if (!contract.value || !sdk.value) return;
  
  decrypting.value = true;
  try {
    // Get encrypted count from contract
    const encryptedCount = await contract.value.getCount();
    
    // Create signature for decryption
    const publicKey = await sdk.value.getPublicKey();
    const signature = await sdk.value.createEIP712(publicKey);
    
    // Decrypt it
    const [decrypted] = await decrypt(encryptedCount, signature);
    count.value = decrypted;
  } catch (error) {
    console.error('Get count failed:', error);
  } finally {
    decrypting.value = false;
  }
};
</script>

<template>
  <div>
    <div v-if="!initialized">Initializing...</div>
    <div v-else>
      <p>Connected: {{ address }}</p>
      <p>Count: {{ count ?? '???' }}</p>
      <button @click="incrementCounter" :disabled="encrypting">
        {{ encrypting ? 'Encrypting...' : 'Increment' }}
      </button>
      <button @click="getCount" :disabled="decrypting">
        {{ decrypting ? 'Decrypting...' : 'Get Count' }}
      </button>
    </div>
  </div>
</template>
```

## Error Handling

All composables throw errors when operations fail. Use try-catch blocks:

```typescript
const { encrypt } = useEncrypt();

const handleEncrypt = async () => {
  try {
    const result = await encrypt(inputs);
    // Proceed with result
  } catch (error) {
    if (error.message === 'SDK not initialized') {
      console.error('Please wait for initialization');
    } else {
      console.error('Encryption failed:', error);
    }
  }
};
```

## Common Errors

**"useFhevm() must be used inside FhevmPlugin"**
- Ensure `FhevmPlugin` is registered in your Vue app
- Use composables only within components

**"SDK not initialized"**
- Check that `initialized.value` is `true` before calling encrypt/decrypt
- Wait for the plugin to complete initialization

**"MetaMask not detected"**
- User needs to install MetaMask browser extension

**Network switching errors**
- User may need to manually add the network to MetaMask
- Verify that `chainId` and `rpcUrl` are correct in plugin options

## Composition API

All composables follow Vue 3 Composition API conventions:

- Return reactive `Ref` objects for state
- Return plain functions for actions
- Can be used in `<script setup>` or `setup()` function
- Automatically track dependencies