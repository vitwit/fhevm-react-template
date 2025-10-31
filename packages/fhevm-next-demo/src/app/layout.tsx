"use client";

import React from "react";
import { FhevmProvider } from "@fhevm/react";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif",}}>
        <FhevmProvider
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
