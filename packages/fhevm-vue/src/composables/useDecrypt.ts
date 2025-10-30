import { useFhevm } from "./useFhevm";

export function useDecrypt() {
  const { sdk, address } = useFhevm();

  const decrypt = async (encrypted: any, sig: string) => {
    if (!sdk.value || !address.value) throw new Error("SDK not initialized");
    return sdk.value.decrypt([encrypted], address.value, sig);
  };

  return { decrypt };
}
