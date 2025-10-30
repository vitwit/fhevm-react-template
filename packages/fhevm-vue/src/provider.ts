import { App, inject, ref, Ref } from "vue";
import { ethers } from "ethers";
import { FhevmUniversalSDK } from "@fhevm/sdk";

export interface FhevmContext {
    sdk: Ref<FhevmUniversalSDK | null>;
    provider: Ref<ethers.Provider | null>;
    signer: Ref<ethers.Signer | null>;
    address: Ref<string | null>;
    loading: Ref<boolean>;
    initialized: Ref<boolean>;
}

const FhevmSymbol = Symbol("FhevmContext");

export interface FhevmOptions {
    network: "devnet" | "testnet" | "mainnet";
    rpcUrl: string;
    contractAddress: string;
    chainId?: number;
}

function createFhevm(options: FhevmOptions) {
    const sdk = ref<FhevmUniversalSDK | null>(null);
    const provider = ref<ethers.Provider | null>(null);
    const signer = ref<ethers.Signer | null>(null);
    const address = ref<string | null>(null);
    const loading = ref(true);
    const initialized = ref(false);

    const init = async () => {
        try {
            if (!window.ethereum) throw new Error("MetaMask not detected");

            const { network, rpcUrl, contractAddress, chainId = 11155111 } = options;

            const hexChainId = "0x" + chainId.toString(16);
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
            if (currentChainId !== hexChainId) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: hexChainId }],
                    });
                } catch (err: any) {
                    if (err.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                {
                                    chainId: hexChainId,
                                    chainName: "Sepolia Testnet",
                                    rpcUrls: [rpcUrl],
                                    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                                },
                            ],
                        });
                    } else {
                        throw err;
                    }
                }
            }

            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await browserProvider.getSigner();
            const userAddress = await _signer.getAddress();

            const fhevm = new FhevmUniversalSDK({ network }, _signer);
            await fhevm.init(contractAddress);

            provider.value = browserProvider;
            signer.value = _signer;
            sdk.value = fhevm;
            address.value = userAddress;
            initialized.value = true;
        } catch (err) {
            console.error("FHEVM init error:", err);
        } finally {
            loading.value = false;
        }
    };

    init();

    return {
        sdk,
        provider,
        signer,
        address,
        loading,
        initialized,
    };
}

export const FhevmPlugin = {
    install(app: App, options: FhevmOptions) {
        const context = createFhevm(options);
        app.provide(FhevmSymbol, context);
    },
};

export function useFhevm(): FhevmContext {
    const ctx = inject<FhevmContext>(FhevmSymbol);
    if (!ctx) throw new Error("useFhevm() must be used inside FhevmPlugin");
    return ctx;
}
