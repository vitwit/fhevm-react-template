# 🧩 @fhevm/react

React bindings for the FHEVM SDK
This package provides a simple provider and hooks to integrate Fully Homomorphic Encryption (FHE) smart contracts into any React or Next.js application.

## ✨ Features

- Plug-and-play MetaMask connection
- Automatic chain switching (e.g., Sepolia)
- Built-in FhevmUniversalSDK initialization
- Simple hooks for SDK access and encryption/decryption
- Works in React, Next.js, Vite, or any modern React runtime

## 📦 Installation

```
pnpm add @fhevm/react @fhevm/sdk ethers
# or
npm install @fhevm/react @fhevm/sdk ethers
```

## 🚀 Quick Start

### 1️⃣ Wrap your app with `FhevmProvider`

``` tsx
// App.tsx or _app.tsx
import React from "react";
import { FhevmProvider } from "@fhevm/react";

function App({ children }: { children?: React.ReactNode }) {
  return (
    <FhevmProvider
      network="testnet"
      rpcUrl={process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/your-key"}
      contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xYourContractAddress"}
      chainId={11155111}
    >
      {children}
    </FhevmProvider>
  );
}

export default App;
```

💡 Works for:
- Next.js App Router: wrap <FhevmProvider> in layout.tsx
- Classic React / CRA / Vite: wrap <App /> or index.tsx root

### 2️⃣ Use the SDK anywhere


## 🧠 Notes

- Requires MetaMask or another EIP-1193 compatible wallet.
- Provider automatically switches to the correct chain.
- You can easily replace MetaMask with WalletConnect or RainbowKit if needed.