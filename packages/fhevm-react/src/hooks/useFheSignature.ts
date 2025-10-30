import { useCallback, useState } from "react";
import { useFhevm } from "./../context/FhevmProvider";

export function useFheSignature() {
  const { sdk, initialized } = useFhevm();
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSignature = useCallback(async () => {
    if (!sdk || !initialized) {
      setError("FHEVM not initialized");
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const pk = await sdk.getPublicKey();
      const sig = await sdk.createEIP712(pk);
      setSignature(sig);
      return sig;
    } catch (err: any) {
      setError(err.message || "Signature creation failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk, initialized]);

  return { createSignature, signature, loading, error };
}
