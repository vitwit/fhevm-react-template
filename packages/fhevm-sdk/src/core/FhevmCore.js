import { Fhevm } from "./internal/Fhevm";
import { RelayerSDKLoader } from "./internal/RelayerSDKLoader";
import { isBrowser } from "../utils/env";
/**
 * High-level FHEVM SDK interface.
 * Wraps the low-level Fhevm instance and handles environment-specific initialization.
 */
export class FhevmCore {
    context;
    relayerLoader;
    trace;
    instance;
    /**
     * @param config SDK configuration
     * @param wallet Optional wallet adapter
     * @param trace Optional trace function for logging
     */
    constructor(config, wallet, trace) {
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
    async init() {
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
    async encrypt(data) {
        if (!this.instance)
            throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.encrypt(data);
    }
    /**
     * Decrypts ciphertext using the initialized Fhevm instance
     */
    async decrypt(ciphertext) {
        if (!this.instance)
            throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.decrypt(ciphertext);
    }
    /**
     * Retrieves the public key for encryption
     */
    async getPublicKey() {
        if (!this.instance)
            throw new Error("FhevmCore: SDK not initialized. Call init() first.");
        return this.instance.getPublicKey();
    }
}
