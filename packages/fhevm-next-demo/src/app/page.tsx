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

  const contract = signer ? new ethers.Contract(FHECounter.address, FHECounter.abi, signer) : null;

  const getCounter = async () => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    try {
      const encryptedValue = await contract.getCount();
      const pk = await sdk.getPublicKey();
      const sig = await sdk.createEIP712(pk);
      const decrypted = await sdk.decrypt([encryptedValue], address, sig);
      setCounter(Number(decrypted.plaintext));
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

  if (loading) return <p>🔌 Connecting to MetaMask...</p>;
  if (!initialized) return <p>⚙️ Initializing FHE SDK...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h2>🔐 Encrypted Counter</h2>
      <p>Connected as: {address}</p>
      <h3>{counter === null ? "…" : counter}</h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button onClick={() => changeCounter("decrement")} disabled={busy}>➖ Decrement</button>
        <button onClick={() => changeCounter("increment")} disabled={busy}>➕ Increment</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={getCounter} disabled={busy}>🔄 Refresh</button>
      </div>

      {busy && <p>⏳ Please wait…</p>}
    </div>
  );
}
