import { useFhevm } from "./context/FhevmProvider";
import { useMemo } from "react";
import { ethers } from "ethers";

export function useFhevmContract(address: string, abi: any) {
    const { signer, sdk } = useFhevm();

    const contract = useMemo(() => {
        if (!signer) return null;
        return new ethers.Contract(address, abi, signer);
    }, [signer, address, abi]);

    return { contract, sdk };
}
