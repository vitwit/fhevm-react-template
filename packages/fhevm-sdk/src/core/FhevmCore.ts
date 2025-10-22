import { Fhevm, FhevmSDKContext } from "./internal/Fhevm";
import { RelayerSDKLoader } from "./internal/RelayerSDKLoader";
import { FhevmConfig, FhevmInstance, FhevmWallet, TraceType } from "./internal/FhevmTypes";
import { isBrowser } from "../utils/env";

/**
 * High-level FHEVM SDK interface.
 * Wraps the low-level Fhevm instance and handles environment-specific initialization.
 */
export class FhevmCore {
    private context: FhevmSDKContext;
    private relayerLoader?: RelayerSDKLoader;
    private trace?: TraceType;

    public instance?: FhevmInstance;

    /**
     * @param config SDK configuration
     * @param wallet Optional wallet adapter
     * @param trace Optional trace function for logging
     */
    constructor(config: FhevmConfig, wallet?: FhevmWallet, trace?: TraceType) {
        this.context = { config, wallet };
        this.trace = trace;

        if (isBrowser()) {
            this.relayerLoader = new RelayerSDKLoader({ trace });
        }
    }

    /**
     * Initializes the SDK
     * - Loads the relayer SDK (browser)
     * - Creates the Fhevm instance
     */
    public async init(): Promise<void> {
        this.trace?.("[FhevmCore] init called");

        if (isBrowser() && this.relayerLoader) {
            this.trace?.("[FhevmCore] loading relayer SDK in browser...");
            await this.relayerLoader.load();
            if (window && window.relayerSDK) {
                this.context.relayerSDK = window.relayerSDK;
            }
        }

        // Create the low-level Fhevm instance
        this.instance = new Fhevm(this.context, this.trace);
    }

    /**
     * Encrypts data using the initialized Fhevm instance
     */
    public async encrypt(data: string) {
        if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.encrypt(data);
    }

    /**
     * Decrypts ciphertext using the initialized Fhevm instance
     */
    public async decrypt(ciphertext: string) {
        if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.decrypt(ciphertext);
    }

    /**
     * Retrieves the public key for encryption
     */
    public async getPublicKey() {
        if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.getPublicKey();
    }
}
