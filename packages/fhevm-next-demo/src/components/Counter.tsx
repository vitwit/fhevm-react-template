"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@fhevm/react";
import { abis } from "@fhevm/shared";

const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];

export function Counter() {
  const { sdk, signer, address, loading } = useFhevm();
  const [counter, setCounter] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const contract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(FHECounter.address, FHECounter.abi, signer);
  }, [signer]);

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

  const increment = async () => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    try {
      const { handles, inputProof } = await sdk.encryptInputs(address, [
        { type: "u32", value: 1 },
      ]);
      const tx = await contract.increment(handles[0], inputProof);
      await tx.wait();
      await getCounter();
    } catch (err) {
      console.error("Increment failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const decrement = async () => {
    if (!sdk || !contract || !address) return;
    setBusy(true);
    try {
      const { handles, inputProof } = await sdk.encryptInputs(address, [
        { type: "u32", value: 1 },
      ]);
      const tx = await contract.decrement(handles[0], inputProof);
      await tx.wait();
      await getCounter();
    } catch (err) {
      console.error("Decrement failed:", err);
    } finally {
      setBusy(false);
    }
  };

  // ✅ Only run once when ready
  useEffect(() => {
    if (!loading && sdk && contract && address) {
      getCounter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sdk, contract, address]);

  if (loading) return <p>🕓 Connecting wallet...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h2>🔐 Encrypted Counter</h2>
      <p>Connected: {address}</p>
      <h3>{counter === null ? "…" : counter}</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button onClick={decrement} disabled={busy}>
          ➖ Decrement
        </button>
        <button onClick={increment} disabled={busy}>
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
