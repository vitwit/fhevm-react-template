import { FhevmCore } from "./FhevmCore";
import { FhevmConfig, FhevmWallet, TraceType } from "./internal/FhevmTypes";
import { isBrowser, isNode } from "../utils/env";

/**
 * Universal SDK for FHEVM
 * Handles environment detection and initializes FhevmCore with appropriate wallet.
 */
export class FhevmUniversalSDK {
    private core?: FhevmCore;
    private trace?: TraceType;

    /**
     * Initialize the universal SDK
     * @param config SDK configuration
     * @param wallet Optional wallet adapter
     * @param trace Optional trace function for logging
     */
    constructor(
        private config: FhevmConfig,
        private wallet?: FhevmWallet,
        trace?: TraceType
    ) {
        this.trace = trace;
    }

    /**
     * Initializes the SDK based on environment
     */
    public async init(): Promise<void> {
        this.trace?.("[FhevmUniversalSDK] init called");

        if (isBrowser()) {
            this.trace?.("[FhevmUniversalSDK] detected browser environment");
            this.core = new FhevmCore(this.config, this.wallet, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in browser");
        } else if (isNode()) {
            this.trace?.("[FhevmUniversalSDK] detected Node.js environment");
            // Node.js: Ensure wallet is provided
            if (!this.wallet) {
                throw new Error(
                    "FhevmUniversalSDK: Node.js environment requires a wallet to be provided"
                );
            }
            this.core = new FhevmCore(this.config, this.wallet, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in Node.js");
        } else {
            throw new Error("FhevmUniversalSDK: Unknown environment");
        }
    }

    /**
     * Encrypts data using FhevmCore
     */
    public async encrypt(data: string) {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.encrypt(data);
    }

    /**
     * Decrypts ciphertext using FhevmCore
     */
    public async decrypt(ciphertext: string) {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.decrypt(ciphertext);
    }

    /**
     * Retrieves the public key for encryption
     */
    public async getPublicKey() {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.getPublicKey();
    }
}
