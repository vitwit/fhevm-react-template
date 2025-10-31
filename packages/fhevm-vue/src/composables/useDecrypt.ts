import { ref } from "vue";
import { useFhevm } from "./useFhevm";

export function useDecrypt() {
  const { sdk, address, initialized, contractAddress } = useFhevm();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const decrypt = async (ciphertexts: any[]): Promise<any | null> => {
    if (!sdk.value || !initialized.value || !address.value) {
      error.value = "FHEVM not initialized";
      return null;
    }

    loading.value = true;
    error.value = null;
    try {
      if (contractAddress == null || contractAddress.value == null) {
        throw new Error("empty contract address");
      }
      
      const decrypted = await sdk.value.decrypt(ciphertexts, address.value, [contractAddress.value]);
      return decrypted;
    } catch (err: any) {
      error.value = err.message || "Decryption failed";
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { decrypt, loading, error };
}
