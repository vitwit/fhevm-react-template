import {
  FhevmInstance,
  FhevmSDKContext,
  FhevmDecryptionResult,
  TraceType,
  FhevmRelayerInstance,
  HandleContractPair,
  RelayerEncryptedInput,
} from "./FhevmTypes.js";
import { hexlify } from "ethers";


export type Keypair = { publicKey: string; privateKey: string };


/**
 * Core FHEVM interface.
 * Provides low-level encryption/decryption operations using a relayer SDK instance.
 */
export class Fhevm implements FhevmInstance {
  private context: FhevmSDKContext;
  private trace?: TraceType;
  private keypairCache?: Keypair;
  private contractAddress: string;
  private durationDays: number;


  constructor(context: FhevmSDKContext, contractAddress: string, durationDays: number = 10, trace?: TraceType) {
    this.context = context;
    this.trace = trace;
    this.contractAddress = contractAddress;
    this.durationDays = durationDays;
  }

  private isNodeEnv(): boolean {
    return typeof process !== "undefined" &&
      process.release?.name === "node";
  }

  private async loadNodeModules(): Promise<any> {
    if (!this.isNodeEnv()) return null;
    const fs = await import("fs");
    const path = await import("path");
    return { fs: fs.default, path: path.default };
  }

  private async getKeypairFilePath() {
    const mods = await this.loadNodeModules();
    if (!mods) throw new Error("Not running in Node");
    const { path } = mods;
    return path.resolve(process.cwd(), ".fhevm_keys.json");
  }

  private async loadKeypair(): Promise<Keypair | null> {
    try {
      if (this.isNodeEnv()) {
        const { fs } = await this.loadNodeModules();
        const filePath = await this.getKeypairFilePath();
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          return data;
        }
      } else if (typeof localStorage !== "undefined") {
        const data = localStorage.getItem("fhevm_keypair");
        if (data) return JSON.parse(data);
      }
    } catch (err) {
      this.trace?.("[Fhevm] Failed to load keypair", err);
    }
    return null;
  }

  private async saveKeypair(keypair: Keypair): Promise<void> {
    try {
      if (this.isNodeEnv()) {
        const { fs } = await this.loadNodeModules();
        const filePath = await this.getKeypairFilePath();
        fs.writeFileSync(filePath, JSON.stringify(keypair, null, 2));
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem("fhevm_keypair", JSON.stringify(keypair));
      }
    } catch (err) {
      this.trace?.("[Fhevm] Failed to save keypair", err);
    }
  }

  /**
   * Returns a usable relayer instance.
   * Handles both Node (createInstance) and Browser (already initialized) environments
   */
  public async getRelayerInstance(): Promise<FhevmRelayerInstance> {
    if (!this.context.relayerSDK) {
      throw new Error("Fhevm: relayerSDK is not initialized");
    }

    const sdk = this.context.relayerSDK as any; // temporary cast to bypass TS for runtime checks

    // Node: SDK module exposes createInstance()
    if (typeof sdk.createInstance === "function") {
      this.trace?.("[Fhevm] Using createInstance() for relayer instance");
      const instance = await sdk.createInstance();
      return instance as FhevmRelayerInstance;
    }

    // Browser: already initialized instance
    this.trace?.("[Fhevm] Using pre-initialized relayer instance");
    return sdk as FhevmRelayerInstance;
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
    userAddress: string,
    signature: string,
  ): Promise<FhevmDecryptionResult> {
    this.trace?.("[Fhevm] decrypt called");

    try {
      const instance = await this.getRelayerInstance();

      // Try loading cached or persisted keypair
      if (!this.keypairCache) {
        this.keypairCache = await this.loadKeypair() || undefined;
      }

      if (!this.keypairCache) {
        this.trace?.("[Fhevm] Generating new keypair");
        const keypair = await instance.generateKeypair();
        this.keypairCache = {
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
        };
        this.saveKeypair(this.keypairCache);
      }

      const { publicKey, privateKey } = this.keypairCache;

      let handles: HandleContractPair[] = cyphertexts.map(i => ({
        contractAddress: this.contractAddress,
        handle: i
      }));

      const startTimestamp = Math.floor(Date.now() / 1000).toString();

      const plaintext = await instance.userDecrypt(
        handles,
        privateKey,
        publicKey,
        signature,
        [this.contractAddress],
        userAddress,
        startTimestamp,
        this.durationDays
      );

      return { plaintext };
    } catch (err) {
      this.trace?.("[Fhevm] decrypt error", err);
      throw err;
    }
  }

  public async getPublicKey(): Promise<string> {
    this.trace?.("[Fhevm] getPublicKey called");
    try {
      const instance = await this.getRelayerInstance();
      if (typeof instance.getPublicKey === "function") {
        return await instance.getPublicKey();
      }
      throw new Error("Fhevm: relayer instance does not expose getPublicKey()");
    } catch (err) {
      this.trace?.("[Fhevm] getPublicKey error", err);
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
}

export type { FhevmSDKContext, FhevmInstance };
