# Core

The `@fhevm-sdk/core` package provides the universal SDK for interacting with FHEVM (Fully Homomorphic Encryption Virtual Machine). It handles encryption, decryption, and manages the communication between your application and FHEVM smart contracts.

## Overview

The core package automatically detects your environment (browser or Node.js) and initializes the appropriate encryption handlers. It provides a unified API for:

- Encrypting data before sending to smart contracts
- Decrypting encrypted responses from contracts
- Managing encryption keys and proofs
- Handling EIP-712 signatures for secure operations

## Initialization

### Basic Setup

```typescript
import { FhevmUniversalSDK } from '@fhevm-sdk/core';

const sdk = new FhevmUniversalSDK(config, wallet, trace);
await sdk.init(contractAddress, durationDays);
```

**Parameters:**
- `config`: Configuration object with network and encryption settings
- `wallet`: (Optional in browser, Required in Node.js) Wallet adapter for signing
- `trace`: (Optional) Debug logging function

### `init(contractAddress, durationDays)`

Initializes the SDK and prepares encryption keys.

- `contractAddress`: The FHEVM contract address to interact with
- `durationDays`: (Optional) Key validity duration, defaults to 10 days

```typescript
await sdk.init('0x1234...', 7);
```

## Encryption

### `encryptInputs(userAddress, inputs)`

Encrypts multiple values in a single operation, returning encrypted handles and proof.

**Parameters:**
- `userAddress`: Address of the user performing encryption
- `inputs`: Array of values to encrypt (max 10 items)

**Returns:**
```typescript
{
  handles: Uint8Array[],    // Encrypted ciphertext handles
  inputProof: Uint8Array    // Zero-knowledge proof for verification
}
```

**Supported Types:**
- `bool`: Boolean values
- `u8`, `u16`, `u32`, `u64`, `u128`, `u256`: Unsigned integers
- `address`: Ethereum addresses

**Example:**

```typescript
const result = await sdk.encryptInputs(userAddress, [
  { type: 'u32', value: 42 },
  { type: 'bool', value: true },
  { type: 'address', value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
]);

// Use handles in contract call
await contract.submitEncrypted(result.handles, result.inputProof);
```

**Note:** Maximum 10 inputs per call. For more values, make multiple calls.

## Decryption

### `decrypt(ciphertexts, userAddress, signature)`

Decrypts encrypted values returned from smart contracts.

**Parameters:**
- `ciphertexts`: Array of encrypted values from contract
- `userAddress`: Address requesting decryption
- `signature`: EIP-712 signature authorizing decryption

**Returns:** Decrypted values

```typescript
const decrypted = await sdk.decrypt(
  ['0xabcd...', '0xef01...'],
  userAddress,
  signature
);
```

### `publicDecrypt(ciphertext)`

Decrypts a single publicly accessible ciphertext.

```typescript
const value = await sdk.publicDecrypt('0xabcd...');
```

## Key Management

### `getPublicKey()`

Retrieves the current public key used for encryption.

```typescript
const pubKey = await sdk.getPublicKey();
```

### `createEIP712(pubKey)`

Creates an EIP-712 signature for the given public key, required for decryption authorization.

```typescript
const signature = await sdk.createEIP712(pubKey);
```

## Environment Support

The SDK works in both browser and Node.js environments:

- **Browser**: Automatically uses Web Crypto API and browser wallet
- **Node.js**: Requires a wallet adapter to be provided in the constructor

```typescript
// Node.js example with wallet
import { Wallet } from 'ethers';

const wallet = new Wallet(privateKey);
const sdk = new FhevmUniversalSDK(config, wallet);
```

## Error Handling

Common errors and solutions:

**"SDK not initialized"**
- Call `await sdk.init()` before using any methods

**"Node.js environment requires a wallet"**
- Provide a wallet adapter in the constructor when running in Node.js

**"max input length exceeded"**
- `encryptInputs()` supports maximum 10 inputs per call

## Usage Example

```typescript
import { FhevmUniversalSDK } from '@fhevm-sdk/core';

// Initialize
const sdk = new FhevmUniversalSDK(config, wallet);
await sdk.init(contractAddress);

// Encrypt data
const encrypted = await sdk.encryptInputs(userAddress, [
  { type: 'u32', value: 100 },
  { type: 'bool', value: true }
]);

// Send to contract
const tx = await contract.processEncrypted(
  encrypted.handles,
  encrypted.inputProof
);
await tx.wait();

// Decrypt result
const pubKey = await sdk.getPublicKey();
const signature = await sdk.createEIP712(pubKey);
const result = await sdk.decrypt(
  [contractReturnValue],
  userAddress,
  signature
);
```