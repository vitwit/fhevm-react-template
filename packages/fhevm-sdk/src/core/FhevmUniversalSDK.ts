import { FhevmCore } from "./FhevmCore.js";
import { EncryptionInput, FhevmConfig, FhevmWallet, RelayerEncryptedInput, TraceType, ZamaNetworkConfig } from "../internal/FhevmTypes.js";
import { isBrowser, isNode } from "../utils/env.js";
import { PublicKeyStorage } from "../internal/PublicKeyStorage.js";

/**
 * Universal SDK for FHEVM
 * Handles environment detection and initializes FhevmCore with appropriate wallet.
 */
export class FhevmUniversalSDK {
    private core?: FhevmCore;
    private trace?: TraceType;
    private storage: PublicKeyStorage;

    /**
     * Initialize the universal SDK
     * @param config SDK configuration
     * @param wallet Optional wallet adapter
     * @param trace Optional trace function for logging
     */
    constructor(
        private config: ZamaNetworkConfig,
        private wallet?: FhevmWallet,
        trace?: TraceType
    ) {
        this.trace = trace;
        this.storage = new PublicKeyStorage();
    }

    /**
     * Initializes the SDK based on environment
     */
    public async init(contractAddress: string, durationDays: number = 365): Promise<void> {
        this.trace?.("[FhevmUniversalSDK] init called");

        if (isBrowser()) {
            this.trace?.("[FhevmUniversalSDK] detected browser environment");
            this.core = new FhevmCore(this.config, contractAddress, this.wallet, durationDays, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in browser");
        } else if (isNode()) {
            this.trace?.("[FhevmUniversalSDK] detected Node.js environment");
            if (!this.wallet) {
                throw new Error(
                    "FhevmUniversalSDK: Node.js environment requires a wallet to be provided"
                );
            }
            this.core = new FhevmCore(this.config, contractAddress, this.wallet, durationDays, this.trace);
            await this.core.init();
            this.trace?.("[FhevmUniversalSDK] FhevmCore initialized in Node.js");
        } else {
            throw new Error("FhevmUniversalSDK: Unknown environment");
        }
    }

    /**
     * Encrypts data using FhevmCore
     */
    private async prepareEncryptionBuffer(userAddress: string): Promise<RelayerEncryptedInput> {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        return this.core.prepareEncryptionBuffer(userAddress);
    }

    /**
     * Decrypt ciphertexts using stored or newly generated signature.
     * Automatically generates and stores signature if missing.
     */
    public async decrypt(ciphertexts: string[], userAddress: string, contractAddresses: string[]) {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        if (!this.storage) throw new Error("FhevmUniversalSDK: Storage not initialized");

        let storedData = this.storage.get(userAddress, contractAddresses);

        if (!storedData || !storedData.signature) {
            this.trace?.("[FhevmUniversalSDK] No stored signature found — generating new one...");

            // Generate keypair (public/private)
            const keyPair: any = await this.core.generateKeypair();

            // Use FhevmCore to create the EIP712 signature
            const result = await this.core.createEIP712(contractAddresses, keyPair);

            storedData = {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
                signature: result.signature,
                startTimestamp: result.startTimestamp,
                durationDays: result.durationDays,
                userAddress: result.userAddress,
                contractAddresses: result.contractAddresses,
                eip712: result.eip712,
            };

            // Save it for reuse
            this.storage.set(userAddress, contractAddresses, storedData);
        }

        return this.core.decrypt(
            ciphertexts,
            storedData.contractAddresses,
            storedData.userAddress,
            storedData.privateKey,
            storedData.publicKey,
            storedData.startTimestamp,
            storedData.durationDays,
            storedData.signature,
        );
    }

    public async publicDecrypt(ciphertext: string): Promise<string> {
        if (!this.core) throw new Error("FhevmUniversalSDK: SDK not initialized");
        this.trace?.("[FhevmCore] publicDecrypt called");
        return this.core.publicDecrypt(ciphertext);
    }


    //  Encrypts multiple FHE values in the same buffer, returning ciphertext handles + proof.
    //   Limits max input length to 10.

    public async encryptInputs(
        userAddress: string,
        inputs: EncryptionInput[]
    ): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> {
        if (!Array.isArray(inputs) || inputs.length === 0)
            throw new Error("encryptInputs: input array cannot be empty");

        if (inputs.length > 10)
            throw new Error(
                `encryptInputs: max input length exceeded (max 10, got ${inputs.length})`
            );

        const buffer = await this.prepareEncryptionBuffer(userAddress);

        for (const input of inputs) {
            switch (input.type) {
                case "bool":
                    buffer.addBool(input.value);
                    break;
                case "u8":
                    buffer.add8(input.value);
                    break;
                case "u16":
                    buffer.add16(input.value);
                    break;
                case "u32":
                    buffer.add32(input.value);
                    break;
                case "u64":
                    buffer.add64(input.value);
                    break;
                case "u128":
                    buffer.add128(input.value);
                    break;
                case "u256":
                    buffer.add256(input.value);
                    break;
                case "address":
                    buffer.addAddress(input.value);
                    break;
                default:
                    throw new Error(`encryptInputs: Unsupported type '${(input as any).type}'`);
            }
        }

        const ciphertexts = await buffer.encrypt();
        return ciphertexts;
    }
}
