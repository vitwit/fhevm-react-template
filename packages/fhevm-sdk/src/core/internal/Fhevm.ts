import {
  FhevmInstance,
  FhevmSDKContext,
  FhevmEncryptionResult,
  FhevmDecryptionResult,
  TraceType,
  FhevmRelayerInstance
} from "./FhevmTypes";

/**
 * Core FHEVM interface.
 * Provides low-level encryption/decryption operations using a relayer SDK instance.
 */
export class Fhevm implements FhevmInstance {
  private context: FhevmSDKContext;
  private trace?: TraceType;

  /**
   * @param context SDK context containing relayer instance, wallet, and config
   * @param trace Optional trace function for logging
   */
  constructor(context: FhevmSDKContext, trace?: TraceType) {
    this.context = context;
    this.trace = trace;
  }

  /**
   * Encrypts a plaintext string using FHEVM
   * @param data The plaintext to encrypt
   */
  public async encrypt(data: string): Promise<FhevmEncryptionResult> {
    this.trace?.("[Fhevm] encrypt called");

    if (!this.context.relayerSDK) {
      throw new Error("Fhevm: relayerSDK is not initialized");
    }

    try {
      const instance = (await this.context.relayerSDK.createInstance()) as FhevmRelayerInstance;
      const ciphertext = await instance.encrypt(data);
      return { ciphertext };
    } catch (err) {
      this.trace?.("[Fhevm] encrypt error", err);
      throw err;
    }
  }

  /**
   * Decrypts a ciphertext string using FHEVM
   * @param ciphertext The ciphertext to decrypt
   */
  public async decrypt(ciphertext: string): Promise<FhevmDecryptionResult> {
    this.trace?.("[Fhevm] decrypt called");

    if (!this.context.relayerSDK) {
      throw new Error("Fhevm: relayerSDK is not initialized");
    }

    try {
      const instance = (await this.context.relayerSDK.createInstance()) as FhevmRelayerInstance;
      const plaintext = await instance.decrypt(ciphertext);
      return { plaintext };
    } catch (err) {
      this.trace?.("[Fhevm] decrypt error", err);
      throw err;
    }
  }

  /**
   * Retrieves the public key for encryption
   */
  public async getPublicKey(): Promise<string> {
    this.trace?.("[Fhevm] getPublicKey called");

    if (!this.context.relayerSDK) {
      throw new Error("Fhevm: relayerSDK is not initialized");
    }

    try {
      const instance = (await this.context.relayerSDK.createInstance()) as FhevmRelayerInstance;

      if (typeof instance.getPublicKey === "function") {
        return await instance.getPublicKey();
      }

      throw new Error("Fhevm: relayer instance does not expose getPublicKey()");
    } catch (err) {
      this.trace?.("[Fhevm] getPublicKey error", err);
      throw err;
    }
  }
}

export type { FhevmSDKContext, FhevmInstance };
