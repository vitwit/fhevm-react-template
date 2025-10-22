/**
 * Core FHEVM interface.
 * Provides low-level encryption/decryption operations using a relayer SDK instance.
 */
export class Fhevm {
    context;
    trace;
    /**
     * @param context SDK context containing relayer instance, wallet, and config
     * @param trace Optional trace function for logging
     */
    constructor(context, trace) {
        this.context = context;
        this.trace = trace;
    }
    /**
     * Encrypts a plaintext string using FHEVM
     * @param data The plaintext to encrypt
     */
    async encrypt(data) {
        this.trace?.("[Fhevm] encrypt called");
        if (!this.context.relayerSDK) {
            throw new Error("Fhevm: relayerSDK is not initialized");
        }
        try {
            const instance = (await this.context.relayerSDK.createInstance());
            const ciphertext = await instance.encrypt(data);
            return { ciphertext };
        }
        catch (err) {
            this.trace?.("[Fhevm] encrypt error", err);
            throw err;
        }
    }
    /**
     * Decrypts a ciphertext string using FHEVM
     * @param ciphertext The ciphertext to decrypt
     */
    async decrypt(ciphertext) {
        this.trace?.("[Fhevm] decrypt called");
        if (!this.context.relayerSDK) {
            throw new Error("Fhevm: relayerSDK is not initialized");
        }
        try {
            const instance = (await this.context.relayerSDK.createInstance());
            const plaintext = await instance.decrypt(ciphertext);
            return { plaintext };
        }
        catch (err) {
            this.trace?.("[Fhevm] decrypt error", err);
            throw err;
        }
    }
    /**
     * Retrieves the public key for encryption
     */
    async getPublicKey() {
        this.trace?.("[Fhevm] getPublicKey called");
        if (!this.context.relayerSDK) {
            throw new Error("Fhevm: relayerSDK is not initialized");
        }
        try {
            const instance = (await this.context.relayerSDK.createInstance());
            if (typeof instance.getPublicKey === "function") {
                return await instance.getPublicKey();
            }
            throw new Error("Fhevm: relayer instance does not expose getPublicKey()");
        }
        catch (err) {
            this.trace?.("[Fhevm] getPublicKey error", err);
            throw err;
        }
    }
}
