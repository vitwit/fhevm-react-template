# React

The `@fhevm-sdk/react` package provides React hooks and context providers for seamless FHEVM integration in React applications. It handles wallet connection, SDK initialization, and provides convenient hooks for encryption and decryption operations.

## Overview

This package wraps the core FHEVM SDK with React-specific utilities:

- **FhevmProvider**: Context provider for managing SDK state and wallet connection
- **useFhevm**: Hook to access SDK instance and connection state
- **useEncrypt**: Hook for encrypting data
- **useDecrypt**: Hook for decrypting data
- **useFheSignature**: Hook for creating EIP-712 signatures

## Setup

### FhevmProvider

Wrap your application with `FhevmProvider` to initialize the FHEVM SDK and manage wallet connections.

```tsx
import { FhevmProvider } from '@fhevm-sdk/react';

function App() {
  return (
    <FhevmProvider
      network="testnet"
      rpcUrl="https://sepolia.infura.io/v3/YOUR_KEY"
      contractAddress="0x1234..."
      chainId={11155111}
    >
      <YourApp />
    </FhevmProvider>
  );
}
```

**Props:**

- `network`: Network type - `"devnet"`, `"testnet"`, or `"mainnet"`
- `rpcUrl`: RPC endpoint URL for the network
- `contractAddress`: FHEVM contract address to interact with
- `chainId`: (Optional) Network chain ID, defaults to `11155111` (Sepolia)
- `children`: React components to render

**Features:**

- Automatically detects and connects to MetaMask
- Prompts network switching if user is on wrong chain
- Initializes FHEVM SDK with connected wallet
- Provides loading and error states

## Hooks

### useFhevm

Access the FHEVM SDK instance and connection state.

```tsx
import { useFhevm } from '@fhevm-sdk/react';

function MyComponent() {
  const { sdk, provider, signer, address, loading, initialized, initError } = useFhevm();

  if (loading) return <div>Connecting wallet...</div>;
  if (initError) return <div>Error: {initError}</div>;
  if (!initialized) return <div>Initializing FHEVM...</div>;

  return <div>Connected: {address}</div>;
}
```

**Returns:**

- `sdk`: FhevmUniversalSDK instance (null if not initialized)
- `provider`: Ethers.js provider
- `signer`: Ethers.js signer
- `address`: Connected wallet address
- `loading`: Boolean indicating if MetaMask connection is in progress
- `initialized`: Boolean indicating if FHEVM SDK is ready
- `initError`: Error message if initialization failed

### useEncrypt

Encrypt data for FHEVM smart contracts.

```tsx
import { useEncrypt } from '@fhevm-sdk/react';

function EncryptComponent() {
  const { encrypt, loading, error } = useEncrypt();

  const handleEncrypt = async () => {
    const result = await encrypt([
      { type: 'u32', value: 42 },
      { type: 'bool', value: true }
    ]);

    if (result) {
      // Use result.handles and result.inputProof in contract call
      await contract.submitEncrypted(result.handles, result.inputProof);
    }
  };

  return (
    <button onClick={handleEncrypt} disabled={loading}>
      {loading ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

**Returns:**

- `encrypt(inputs)`: Function to encrypt data
  - `inputs`: Array of `EncryptionInput` objects (max 10)
  - Returns: `{ handles, inputProof }` or `null` on error
- `loading`: Boolean indicating encryption in progress
- `error`: Error message if encryption failed

**Input Types:**

```typescript
type EncryptionInput = 
  | { type: 'bool', value: boolean }
  | { type: 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'u256', value: number | bigint }
  | { type: 'address', value: string };
```

### useDecrypt

Decrypt encrypted values from FHEVM contracts.

```tsx
import { useDecrypt } from '@fhevm-sdk/react';

function DecryptComponent() {
  const { decrypt, loading, error } = useDecrypt();
  const [value, setValue] = useState(null);

  const handleDecrypt = async (ciphertexts: any[]) => {
    const decrypted = await decrypt(ciphertexts);
    if (decrypted) {
      setValue(decrypted);
    }
  };

  return (
    <div>
      <button onClick={() => handleDecrypt(['0xabcd...'])} disabled={loading}>
        {loading ? 'Decrypting...' : 'Decrypt'}
      </button>
      {error && <p>Error: {error}</p>}
      {value && <p>Decrypted: {value}</p>}
    </div>
  );
}
```

**Returns:**

- `decrypt(ciphertexts)`: Function to decrypt data
  - `ciphertexts`: Array of encrypted values from contract
  - Returns: Decrypted values or `null` on error
- `loading`: Boolean indicating decryption in progress
- `error`: Error message if decryption failed

**Note:** This hook automatically handles signature creation for authorization.

### useFheSignature

Create EIP-712 signatures for FHEVM operations.

```tsx
import { useFheSignature } from '@fhevm-sdk/react';

function SignatureComponent() {
  const { createSignature, signature, loading, error } = useFheSignature();

  const handleSign = async () => {
    const sig = await createSignature();
    console.log('Signature:', sig);
  };

  return (
    <button onClick={handleSign} disabled={loading}>
      {loading ? 'Signing...' : 'Create Signature'}
    </button>
  );
}
```

**Returns:**

- `createSignature()`: Function to create signature
  - Returns: Signature string or `null` on error
- `signature`: Latest created signature (persisted in state)
- `loading`: Boolean indicating signature creation in progress
- `error`: Error message if signature creation failed

## Complete Example

```tsx
import { FhevmProvider, useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk/react';
import { ethers } from 'ethers';

// 1. Wrap app with provider
function App() {
  return (
    <FhevmProvider
      network="testnet"
      rpcUrl="https://sepolia.infura.io/v3/YOUR_KEY"
      contractAddress="0x1234..."
    >
      <Counter />
    </FhevmProvider>
  );
}

// 2. Use hooks in components
function Counter() {
  const { sdk, initialized, address } = useFhevm();
  const { encrypt, loading: encrypting } = useEncrypt();
  const { decrypt, loading: decrypting } = useDecrypt();
  const [count, setCount] = useState(null);

  const incrementCounter = async () => {
    // Encrypt the increment value
    const encrypted = await encrypt([{ type: 'u32', value: 1 }]);
    
    if (encrypted) {
      // Call contract
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();
    }
  };

  const getCount = async () => {
    // Get encrypted count from contract
    const encryptedCount = await contract.getCount();
    
    // Decrypt it
    const decrypted = await decrypt([encryptedCount]);
    if (decrypted) {
      setCount(decrypted[0]);
    }
  };

  if (!initialized) return <div>Initializing...</div>;

  return (
    <div>
      <p>Connected: {address}</p>
      <p>Count: {count ?? '???'}</p>
      <button onClick={incrementCounter} disabled={encrypting}>
        Increment
      </button>
      <button onClick={getCount} disabled={decrypting}>
        Get Count
      </button>
    </div>
  );
}
```

## Error Handling

All hooks return error states. Always check for errors before proceeding:

```tsx
const { encrypt, error } = useEncrypt();

const handleEncrypt = async () => {
  const result = await encrypt(inputs);
  
  if (error) {
    console.error('Encryption failed:', error);
    return;
  }
  
  // Proceed with result
};
```

## Common Errors

**"FHEVM not initialized"**
- Ensure `FhevmProvider` wraps your components
- Check that `initialized` is `true` before using hooks

**"MetaMask not detected"**
- User needs to install MetaMask browser extension

**Network switching errors**
- User may need to manually add the network to MetaMask
- Check that `chainId` and `rpcUrl` are correct