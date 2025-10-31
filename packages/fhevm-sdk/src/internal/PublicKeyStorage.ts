/**
 * PublicKeyStorage
 * -----------------
 * Stores and retrieves FHEVM decryption signature data (public/private key,
 * signature, timestamps, etc.) uniquely per user + contract set.
 */

import { isBrowser, isNode } from "../utils/env.js";
import { ethers } from "ethers";
import type { FhevmDecryptionSignatureType } from "./FhevmTypes";

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
     * Build a deterministic storage key per user + contract set.
     */
    private buildStorageKey(userAddress: string, contractAddresses: string[]): string {
        if (!ethers.isAddress(userAddress)) {
            throw new TypeError(`Invalid address ${userAddress}`);
        }

        const sorted = [...contractAddresses].sort();
        const hash = ethers.id(JSON.stringify(sorted));
        return `fhevmPublicKey:${userAddress}:${hash}`;
    }

    /**
     * Save the complete FhevmDecryptionSignatureType data
     */
    public set(userAddress: string, contractAddresses: string[], data: FhevmDecryptionSignatureType): void {
        const key = this.buildStorageKey(userAddress, contractAddresses);
        const value = JSON.stringify(data);

        if (this.storage instanceof Map) {
            this.storage.set(key, value);
        } else {
            this.storage.setItem(key, value);
        }
    }

    /**
     * Retrieve stored data (parsed JSON)
     */
    public get(userAddress: string, contractAddresses: string[]): FhevmDecryptionSignatureType | null {
        const key = this.buildStorageKey(userAddress, contractAddresses);
        const result =
            this.storage instanceof Map ? this.storage.get(key) ?? null : this.storage.getItem(key);

        if (!result) return null;

        try {
            return JSON.parse(result) as FhevmDecryptionSignatureType;
        } catch {
            return null;
        }
    }

    /**
     * Clear stored data for user + contract set
     */
    public clear(userAddress: string, contractAddresses: string[]): void {
        const key = this.buildStorageKey(userAddress, contractAddresses);

        if (this.storage instanceof Map) {
            this.storage.delete(key);
        } else {
            this.storage.removeItem(key);
        }
    }

    /**
     * Optional: Clear all stored FHEVM public key data.
     */
    public clearAll(): void {
        if (this.storage instanceof Map) {
            this.storage.clear();
        } else {
            Object.keys(this.storage).forEach((key) => {
                if (key.startsWith("fhevmPublicKey:")) {
                    this.storage.delete(key);
                }
            });
        }
    }
}
