# Core

`@fhevm/sdk` - The core Universal SDK for integrating Fully Homomorphic Encryption Virtual Machine (FHEVM) into your dApps and services.
It provides a unified interface for encryption, decryption, signature management, and relayer communication - compatible across Node.js, browsers, and multiple frontend frameworks.

## Overview

`FhevmUniversalSDK` automatically detects your environment and initializes FHEVM components with minimal setup.
It supports both frontend (React, Vue, Next.js) and backend (Node.js) environments through a single class.

### Key Features

- Universal Environment Support - Works in both Node.js and browser contexts
- Native FHE Encryption - Handles input encryption and proof generation
- Automated Signature Management - Generates, signs, and caches EIP712 payloads
- Public Key Storage - Local caching of user public keys and signatures
- Extendable Core - Built on top of `@zama-ai/relayer-sdk`

## Installation

``` bash
pnpm add @fhevm/sdk
# or
npm install @fhevm/sdk

```

## Initialization

``` ts
import { FhevmUniversalSDK } from "@fhevm/sdk";

// optional: your wallet implementation (ethers.js, viem, etc.)
import { wallet } from "./wallet";

const sdk = new FhevmUniversalSDK(
    relayerConfig,
    wallet,
    console.log // optional trace logger
  );

// initialize SDK
await sdk.init("0xContractAddressHere");

```

- In Node.js, you must provide a wallet instance.
- In Browser, it auto-detects injected wallet providers (e.g., MetaMask).

## 🔐 Encrypt Inputs

Encrypt multiple typed values into a single FHE buffer and generate ciphertext handles + a proof to submit with your transaction.

``` ts
const ciphertexts = await sdk.encryptInputs(userAddress, [
  { type: "u64", value: 42 },
  { type: "bool", value: true },
  { type: "address", value: "0xabc123..." },
]);

```

### 🔍 Description

- Creates a relayer encryption buffer linked to the given userAddress.
- Adds typed inputs (`bool`, `u8`, `u16`, `u32`, `u64`, `u128`, `u256`, or `address`) into the buffer.
- Encrypts them using the FHEVM public key and generates an input proof.
- Returns a set of ciphertext handles (for smart contract input) and a single proof (for validation).
- ⚠️ Supports up to 10 inputs per encryption to optimize relayer size.

## 🔓 Decrypt Ciphertexts

Decrypts one or more ciphertexts using the user’s FHE keypair and signature.
If no valid keypair or signature is found, a new one is automatically generated and cached.

``` ts
const decrypted = await sdk.decrypt(
  [ciphertext1, ciphertext2],
  userAddress,
  ["0xContractAddress"]
);

console.log("Decrypted values:", decrypted);

```

### 🔍 Description

- Retrieves or generates a user keypair (public/private) for decryption.
- Creates or reuses an EIP-712 signature that authorizes decryption for the specified contracts.
- Returns plaintext values in the same order as provided ciphertexts.
- 💾 Keys and signatures are stored in local cache (PublicKeyStorage) to prevent re-signing each time.

## 🧩 Public Decryption

Decrypts ciphertexts that were explicitly marked as publicly decryptable in the smart contract.
Unlike `decrypt()`, this method does not require a user’s private key or signature.

``` ts
const plaintext = await sdk.publicDecrypt(ciphertext);
console.log("Public decrypted value:", plaintext);
```

### 🔍 Description

- Calls the FHEVM’s public decryption mechanism.
- Intended for ciphertexts generated with publicDecrypt permissions on-chain.
- Returns a readable plaintext string (decoded from ciphertext).

## 🧩 Internal Helpers

### `init(contractAddress, durationDays?)`

- Detects current runtime (Node.js or Browser)
- Initializes `FhevmCore` instance with provided configuration and contract address
- Optional `durationDays` defines how long cached keys/signatures remain valid (default: 365 days)

### `prepareEncryptionBuffer(userAddress)`

- Creates a relayer-linked buffer for sequential encryption operations
- Used internally by `encryptInputs()`

## 🧠 Class Reference

`class FhevmUniversalSDK`

| Method                                                 | Description                                         |
| ------------------------------------------------------ | --------------------------------------------------- |
| `init(contractAddress, durationDays?)`                 | Initializes the SDK for current environment         |
| `encryptInputs(userAddress, inputs)`                   | Encrypts an array of typed inputs                   |
| `decrypt(ciphertexts, userAddress, contractAddresses)` | Decrypts ciphertexts using cached or new signatures |
| `publicDecrypt(ciphertext)`                            | Performs public decryption (non-private)            |
