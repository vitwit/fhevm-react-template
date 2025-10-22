/**
 * PublicKeyStorage provides a simple interface to store/retrieve
 * the FHEVM public key. Works in both browser and Node environments.
 */

import { isBrowser, isNode } from "../../utils/env";

export class PublicKeyStorage {
    private storage: Storage | Map<string, string>;

    constructor() {
        if (isBrowser() && typeof window.localStorage !== "undefined") {
            this.storage = window.localStorage;
        } else if (isNode()) {
            this.storage = new Map<string, string>();
        } else {
            throw new Error("PublicKeyStorage: Unknown environment");
        }
    }

    /**
     * Save the public key
     * @param key The public key string
     */
    public set(key: string): void {
        if (this.storage instanceof Map) {
            this.storage.set("fhevmPublicKey", key);
        } else {
            this.storage.setItem("fhevmPublicKey", key);
        }
    }

    /**
     * Retrieve the public key
     * @returns string | null
     */
    public get(): string | null {
        if (this.storage instanceof Map) {
            return this.storage.get("fhevmPublicKey") ?? null;
        } else {
            return this.storage.getItem("fhevmPublicKey");
        }
    }

    /**
     * Clear stored public key
     */
    public clear(): void {
        if (this.storage instanceof Map) {
            this.storage.delete("fhevmPublicKey");
        } else {
            this.storage.removeItem("fhevmPublicKey");
        }
    }
}
