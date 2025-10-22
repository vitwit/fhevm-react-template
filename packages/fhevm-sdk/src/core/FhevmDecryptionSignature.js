/**
 * FhevmDecryptionSignature provides methods to sign or verify messages.
 * Works in both browser and Node.js environments using standard wallets.
 */
import { isBrowser, isNode } from "./../utils/env";
import { ethers } from "ethers";
export class FhevmDecryptionSignature {
    wallet;
    constructor(wallet) {
        if (!wallet)
            throw new Error("FhevmDecryptionSignature: wallet is required");
        this.wallet = wallet;
    }
    /**
     * Sign a message (e.g., decrypted data)
     * @param message string
     * @returns signed message string
     */
    async signMessage(message) {
        if (isBrowser()) {
            if (!this.wallet.signMessage) {
                throw new Error("FhevmDecryptionSignature: Browser wallet does not support signMessage()");
            }
            return await this.wallet.signMessage(message);
        }
        else if (isNode()) {
            if (!(this.wallet instanceof ethers.Wallet)) {
                throw new Error("FhevmDecryptionSignature: Node wallet must be an ethers.Wallet instance");
            }
            return await this.wallet.signMessage(message);
        }
        else {
            throw new Error("FhevmDecryptionSignature: Unknown environment");
        }
    }
    /**
     * Verify a signed message
     * @param message Original message
     * @param signature Signature to verify
     * @returns address of signer
     */
    async verifyMessage(message, signature) {
        try {
            return ethers.verifyMessage(message, signature);
        }
        catch (err) {
            throw new Error(`FhevmDecryptionSignature: verification failed - ${err}`);
        }
    }
}
