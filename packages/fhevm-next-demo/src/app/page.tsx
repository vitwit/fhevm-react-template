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

  const contract = signer
    ? new ethers.Contract(FHECounter.address, FHECounter.abi, signer)
    : null;

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

  useEffect(() => {
    if (initialized && sdk && contract && address) {
      getCounter();
    }
  }, [initialized]);

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
