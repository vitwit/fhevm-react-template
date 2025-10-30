import { useState, useCallback } from "react";
import { useFhevm } from "./../context/FhevmProvider";

export function useDecrypt() {
    const { sdk, address, initialized } = useFhevm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const decrypt = useCallback(
        async (ciphertexts: any[]): Promise<any | null> => {
            if (!sdk || !initialized || !address) {
                setError("FHEVM not initialized");
                return null;
            }

            setLoading(true);
            setError(null);
            try {
                const publicKey = await sdk.getPublicKey();
                const signature = await sdk.createEIP712(publicKey);
                const decrypted = await sdk.decrypt(ciphertexts, address, signature);
                return decrypted;
            } catch (err: any) {
                setError(err.message || "Decryption failed");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [sdk, address, initialized],
    );

    return { decrypt, loading, error };
}
