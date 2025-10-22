import { useFhevmContext } from "../context/FhevmProvider";

export const useFhevm = () => {
  const { sdk, initialized, error } = useFhevmContext();

  if (!initialized) throw new Error("Fhevm SDK not initialized yet");
  if (error) throw error;

  return sdk!;
};
