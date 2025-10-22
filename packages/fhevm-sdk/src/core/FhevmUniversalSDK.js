import { FhevmCore } from "./FhevmCore";
import { isBrowser, isNode } from "../utils/env";
/**
 * Universal SDK for FHEVM
 * Handles environment detection and initializes FhevmCore with appropriate wallet.
 */
export class FhevmUniversalSDK {
    config;
    wallet;
    core;
    trace;
    /**
     * Initialize the universal SDK
     * @param config SDK configuration
     * @param wallet Optional wallet adapter
     * @param trace Optional trace function for logging
     */
    constructor(config, wallet, trace) {
        this.config = config;
        this.wallet = wallet;
        this.trace = trace;
    }
    /**
     * Initializes the SDK based on environment
     */
    async init() {
        this.trace?.("[FhevmUniversalSDK] init called");
        if (isBrowser()) {
            this.trace?.("[FhevmUniversalSDK] detected browser environment");
            this.core = new FhevmCore(this.config, this.wallet, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in browser");
        }
        else if (isNode()) {
            this.trace?.("[FhevmUniversalSDK] detected Node.js environment");
            // Node.js: Ensure wallet is provided
            if (!this.wallet) {
                throw new Error("FhevmUniversalSDK: Node.js environment requires a wallet to be provided");
            }
            this.core = new FhevmCore(this.config, this.wallet, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in Node.js");
        }
        else {
            throw new Error("FhevmUniversalSDK: Unknown environment");
        }
    }
    /**
     * Encrypts data using FhevmCore
     */
    async encrypt(data) {
        if (!this.core)
            throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.encrypt(data);
    }
    /**
     * Decrypts ciphertext using FhevmCore
     */
    async decrypt(ciphertext) {
        if (!this.core)
            throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.decrypt(ciphertext);
    }
    /**
     * Retrieves the public key for encryption
     */
    async getPublicKey() {
        if (!this.core)
            throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.getPublicKey();
    }
}
