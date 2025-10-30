import { useState, useCallback } from "react";
import { useFhevm } from "./../context/FhevmProvider";
import { EncryptionInput } from "@fhevm/sdk";

interface EncryptResult {
    handles: Uint8Array[];
    inputProof: Uint8Array;
}

export function useEncrypt() {
    const { sdk, address, initialized } = useFhevm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const encrypt = useCallback(
        async (inputs: EncryptionInput[]): Promise<EncryptResult | null> => {
            if (!sdk || !initialized || !address) {
                setError("FHEVM not initialized");
                return null;
            }

            setLoading(true);
            setError(null);
            try {
                const { handles, inputProof } = await sdk.encryptInputs(address, inputs);
                return { handles, inputProof };
            } catch (err: any) {
                setError(err.message || "Encryption failed");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [sdk, address, initialized],
    );

    return { encrypt, loading, error };
}
