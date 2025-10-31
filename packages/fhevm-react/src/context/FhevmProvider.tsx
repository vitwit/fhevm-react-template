import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { FhevmUniversalSDK } from "@fhevm/sdk";

interface FhevmContextValue {
    sdk: FhevmUniversalSDK | null;
    provider: ethers.Provider | null;
    signer: ethers.Signer | null;
    loading: boolean; // MetaMask + setup
    initialized: boolean; // FHEVM SDK initialized
    contractAddress: string;
    initError?: string;
    address?: string;
}

const FhevmContext = createContext<FhevmContextValue>({
    sdk: null,
    provider: null,
    signer: null,
    loading: true,
    contractAddress: "",
    initialized: false,
});

interface FhevmProviderProps {
    network: "devnet" | "testnet" | "mainnet";
    rpcUrl: string;
    contractAddress: string;
    chainId?: number;
    children: React.ReactNode;
}

export const FhevmProvider: React.FC<FhevmProviderProps> = ({
    network,
    rpcUrl,
    contractAddress,
    chainId = 11155111,
    children,
}) => {
    const [sdk, setSdk] = useState<FhevmUniversalSDK | null>(null);
    const [provider, setProvider] = useState<ethers.Provider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [initError, setInitError] = useState<string>();
    const [address, setAddress] = useState<string>();

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setInitError(undefined);
                setInitialized(false);

                if (!window.ethereum) throw new Error("MetaMask not detected");

                // Ensure correct network in MetaMask
                const hexChainId = "0x" + chainId.toString(16);
                const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
                if (currentChainId !== hexChainId) {
                    try {
                        await window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: hexChainId }],
                        });
                    } catch (switchError: any) {
                        if (switchError.code === 4902) {
                            await window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    {
                                        chainId: hexChainId,
                                        chainName: "Sepolia Testnet",
                                        rpcUrls: [rpcUrl],
                                        nativeCurrency: {
                                            name: "SepoliaETH",
                                            symbol: "ETH",
                                            decimals: 18,
                                        },
                                        blockExplorerUrls: ["https://sepolia.etherscan.io"],
                                    },
                                ],
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }

                // Connect MetaMask
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                const signer = await browserProvider.getSigner();
                const walletAddress = await signer.getAddress();

                // Create SDK instance
                const fhevm = new FhevmUniversalSDK({ network }, signer);

                // Initialize SDK for a specific contract
                await fhevm.init(contractAddress);

                setProvider(browserProvider);
                setSigner(signer);
                setSdk(fhevm);
                setAddress(walletAddress);
                setInitialized(true);
            } catch (err: any) {
                console.error("Failed to initialize FHEVM:", err);
                setInitError(err.message || "Initialization failed");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [network, rpcUrl, contractAddress]);

    const value = useMemo(
        () => ({ sdk, provider, signer, address,contractAddress, loading, initialized, initError }),
        [sdk, provider, signer, address,contractAddress, loading, initialized, initError],
    );

    return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
};

export const useFhevm = () => useContext(FhevmContext);
