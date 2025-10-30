# React Example

This example demonstrates how to build a fully homomorphic encrypted (FHE) counter application using Next.js and the FHEVM React SDK. The counter value is stored encrypted on-chain and can only be decrypted by authorized users.

## Overview

The example showcases:
- Setting up FHEVM in a Next.js application
- Encrypting data before sending to smart contracts
- Decrypting encrypted values from contracts
- Managing wallet connection and SDK initialization

## Project Structure

```
fhevm-next-demo/
├── src/app/
│   ├── layout.tsx       # Root layout with FhevmProvider
│   └── page.tsx         # Counter component
├── .env.local           # Environment variables
└── package.json
```

## Setup

### 1. Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...
```

### 2. Root Layout

Wrap your application with `FhevmProvider` in `layout.tsx`:

```tsx
"use client";

import React from "react";
import { FhevmProvider } from "@fhevm/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "2rem" }}>
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

## Counter Component

### Initialize Contract and SDK

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@fhevm/react";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

export default function HomePage() {
  const { sdk, signer, address, initialized, loading } = useFhevm();
  const [counter, setCounter] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Create contract instance
  const contract = signer 
    ? new ethers.Contract(FHECounter.address, FHECounter.abi, signer) 
    : null;
```

### Reading Encrypted Values

```tsx
  const getCounter = async () => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    
    try {
      // 1. Get encrypted value from contract
      const encryptedValue = await contract.getCount();
      
      // 2. Get public key and create signature
      const pk = await sdk.getPublicKey();
      const sig = await sdk.createEIP712(pk);
      
      // 3. Decrypt the value
      const decrypted = await sdk.decrypt([encryptedValue], address, sig);
      setCounter(Number(decrypted.plaintext));
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

### Writing Encrypted Values

```tsx
  const changeCounter = async (method: "increment" | "decrement") => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    
    try {
      // 1. Encrypt the input value
      const { handles, inputProof } = await sdk.encryptInputs(address, [
        { type: "u32", value: 1 },
      ]);
      
      // 2. Send encrypted data to contract
      const tx = await contract[method](handles[0], inputProof);
      await tx.wait();
      
      // 3. Refresh counter value
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

### Auto-fetch on Mount

```tsx
  useEffect(() => {
    if (initialized && sdk && contract && address) {
      getCounter();
    }
  }, [initialized]);
```

Automatically fetch the counter value once the SDK is initialized.

### UI Rendering

```tsx
  if (loading) return <p>🔌 Connecting to MetaMask...</p>;
  if (!initialized) return <p>⚙️ Initializing FHE SDK...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h2>🔐 Encrypted Counter</h2>
      <p>Connected as: {address}</p>
      <h3>{counter === null ? "…" : counter}</h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button onClick={() => changeCounter("decrement")} disabled={busy}>
          ➖ Decrement
        </button>
        <button onClick={() => changeCounter("increment")} disabled={busy}>
          ➕ Increment
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={getCounter} disabled={busy}>
          🔄 Refresh
        </button>
      </div>

      {busy && <p>⏳ Please wait…</p>}
    </div>
  );
}
```

**UI States:**
- Loading: Shows while connecting to MetaMask
- Initializing: Shows while FHEVM SDK is setting up
- Ready: Shows counter with increment/decrement buttons
- Busy: Disables buttons during operations

## Complete Flow

### Incrementing the Counter

1. User clicks "Increment" button
2. SDK encrypts the value `1` as `u32`
3. Encrypted handles and proof sent to `contract.increment()`
4. Transaction is mined on-chain
5. Counter is automatically refreshed
6. Decrypted value displayed to user

### Reading the Counter

1. User clicks "Refresh" button (or on initial load)
2. Contract returns encrypted counter value
3. SDK generates signature for decryption authorization
4. SDK decrypts the value
5. Decrypted number displayed in UI

## Key Concepts

### Encryption

```typescript
const { handles, inputProof } = await sdk.encryptInputs(address, [
  { type: "u32", value: 1 },
]);
```

- `handles`: Encrypted ciphertext to send to contract
- `inputProof`: Zero-knowledge proof for verification
- All computation happens on encrypted data

### Decryption

```typescript
const pk = await sdk.getPublicKey();
const sig = await sdk.createEIP712(pk);
const decrypted = await sdk.decrypt([encryptedValue], address, sig);
```

- Requires user signature for authorization
- Only authorized addresses can decrypt
- Values remain encrypted on-chain

## Running the Examplex

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Open http://localhost:3000
```

## Common Issues

**"SDK not initialized"**
- Wait for `initialized` to be `true` before operations
- Check that MetaMask is connected

**Decryption fails**
- Ensure user has permission to decrypt the value
- Verify signature is created correctly

**Transaction reverts**
- Check that encrypted data format matches contract expectations
- Verify inputProof is included in transaction

## Next Steps

Extend this example by:
- Adding multiple encrypted state variables
- Implementing access control for decryption
- Creating more complex FHE operations (addition, comparison, etc.)
- Building a multi-user encrypted application