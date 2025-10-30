import { useFhevm } from "./useFhevm";
import type { EncryptionInput } from "@fhevm/sdk";

export function useEncrypt() {
    const { sdk, address } = useFhevm();

    const encrypt = async (inputs: EncryptionInput | EncryptionInput[]) => {
        if (!sdk.value || !address.value) throw new Error("SDK not initialized");

        const inputArray = Array.isArray(inputs) ? inputs : [inputs];

        return sdk.value.encryptInputs(address.value, inputArray);
    };

    return { encrypt };
}
