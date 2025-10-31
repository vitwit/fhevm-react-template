import {
  FhevmInstance,
  FhevmSDKContext,
  FhevmDecryptionResult,
  TraceType,
  FhevmRelayerInstance,
  HandleContractPair,
  RelayerEncryptedInput,
} from "./FhevmTypes.js";

export type Keypair = { publicKey: string; privateKey: string };


/**
 * Core FHEVM interface.
 * Provides low-level encryption/decryption operations using a relayer SDK instance.
 */
export class Fhevm implements FhevmInstance {
  private context: FhevmSDKContext;
  private trace?: TraceType;
  private contractAddress: string;
  private relayerInstance?: FhevmRelayerInstance;

  constructor(context: FhevmSDKContext, contractAddress: string, trace?: TraceType) {
    this.context = context;
    this.trace = trace;
    this.contractAddress = contractAddress;
  }


  /**
     * Returns (and caches) a relayer instance.
     * The first call initializes it; subsequent calls reuse the cached one.
     */
  public async getRelayerInstance(): Promise<FhevmRelayerInstance> {
    if (this.relayerInstance) {
      this.trace?.("[Fhevm] Using cached relayer instance");
      return this.relayerInstance;
    }

    if (!this.context.relayerSDK) {
      throw new Error("Fhevm: relayerSDK is not initialized");
    }

    const sdk = this.context.relayerSDK as any;

    // Node: SDK exposes createInstance()
    if (typeof sdk.createInstance === "function") {
      this.trace?.("[Fhevm] Creating new relayer instance (Node)");
      this.relayerInstance = await sdk.createInstance();
    } else {
      // Browser: already initialized instance
      this.trace?.("[Fhevm] Using pre-initialized relayer instance (Browser)");
      this.relayerInstance = sdk as FhevmRelayerInstance;
    }

    return this.relayerInstance!;
  }

  public async prepareEncryptionBuffer(userAddress: string): Promise<RelayerEncryptedInput> {
    this.trace?.("[Fhevm] encrypt called");
    try {
      const instance = await this.getRelayerInstance();

      const buffer = instance.createEncryptedInput(this.contractAddress, userAddress);
      return buffer;
    } catch (err) {
      this.trace?.("[Fhevm] encrypt error", err);
      throw err;
    }
  }

  public async decrypt(
    cyphertexts: string[],
    contractAddresses: string[],
    userAddress: string,
    privateKey: string,
    publicKey: string,
    startTimestamp: number,
    durationDays: number,
    signature: string,
  ): Promise<FhevmDecryptionResult> {
    this.trace?.("[Fhevm] decrypt called");

    try {
      const instance = await this.getRelayerInstance();

      let handles: HandleContractPair[] = cyphertexts.map(i => ({
        contractAddress: contractAddresses[0],
        handle: i
      }));

      const plaintext = await instance.userDecrypt(
        handles,
        privateKey,
        publicKey,
        signature,
        [this.contractAddress],
        userAddress,
        startTimestamp,
        durationDays
      );

      return { plaintext };
    } catch (err) {
      this.trace?.("[Fhevm] decrypt error", err);
      throw err;
    }
  }

  public async publicDecrypt(ciphertext: string): Promise<string> {
    this.trace?.("[Fhevm] public decrypt called");
    try {
      const instance = await this.getRelayerInstance();

      const decryptedText = await instance.publicDecrypt(ciphertext);
      return decryptedText;
    } catch (err) {
      this.trace?.("[Fhevm] public decrypt error", err);
      throw err;
    }
  }

  public async generateKeypair(): Promise<void> {
    try {
      const instance = await this.getRelayerInstance();

      this.trace?.("[Fhevm] Generating new keypair");
      const keypair = await instance.generateKeypair();
      return keypair;
    } catch (err: any) {
      this.trace?.("[Fhevm] key generation error", err);
      throw err;
    }
  }
}

export type { FhevmSDKContext, FhevmInstance };
