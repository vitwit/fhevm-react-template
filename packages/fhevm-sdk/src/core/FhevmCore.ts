import { Fhevm, FhevmSDKContext } from "../internal/Fhevm.js";
import type {
  FhevmWallet, FhevmInstance, TraceType, RelayerEncryptedInput,
  FhevmDecryptionSignatureType,
  ZamaNetworkConfig
} from "../internal/FhevmTypes.js";
import { RelayerSDKLoader } from "../internal/RelayerSDKLoader.js";

/**
 * FhevmCore: Universal wrapper
 * Handles SDK initialization and exposes encrypt/decrypt/getPublicKey
 */
export class FhevmCore {
  private context: FhevmSDKContext;
  private relayerLoader: RelayerSDKLoader;
  private trace?: TraceType;
  private contractAddress: string;
  private durationDays: number;

  public instance?: FhevmInstance;

  constructor(contractAddress: string, wallet?: FhevmWallet, config?: ZamaNetworkConfig, durationDays: number = 365,
    trace?: TraceType) {
    this.context = { config, wallet };

    this.contractAddress = contractAddress;
    this.durationDays = durationDays;

    this.trace = trace;
    this.relayerLoader = new RelayerSDKLoader({ trace });
  }

  /**
   * Initialize the SDK (Node or Browser)
   */
  public async init(): Promise<void> {
    this.trace?.("[FhevmCore] init called");

    // Load SDK dynamically
    await this.relayerLoader.load();
    const sdkModule = this.relayerLoader.getSDK();

    // Normalize relayerSDK instance
    if (sdkModule.createInstance && typeof sdkModule.createInstance === "function") {
      this.trace?.("[FhevmCore] Initializing relayer via initSDK()");
      if (sdkModule.initSDK) {
        await sdkModule.initSDK();
      }
      if (this.context.config) {
        this.context.relayerSDK = await sdkModule.createInstance({
          ...this.context.config,
        });
      } else {
        this.context.relayerSDK = await sdkModule.createInstance({
          ...sdkModule.SepoliaConfig,
        });
      }


    } else if (sdkModule.initSDK && typeof sdkModule.initSDK === "function") {
      this.trace?.("[FhevmCore] Initializing relayer via initSDK()");
      this.context.relayerSDK = await sdkModule.initSDK();
    } else {
      throw new Error(
        "FhevmCore: SDK module must expose either createInstance() or initSDK()"
      );
    }

    this.trace?.("[FhevmCore] Relayer SDK initialized successfully");

    // Create the Fhevm instance
    this.instance = new Fhevm(this.context, this.contractAddress, this.trace);
    this.trace?.("[FhevmCore] FHEVM instance initialized successfully");
  }

  public async prepareEncryptionBuffer(userAddress: string): Promise<RelayerEncryptedInput> {
    if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
    this.trace?.("[FhevmCore] prepareEncryptionBuffer called");
    return this.instance.prepareEncryptionBuffer(userAddress);
  }

  public async decrypt(
    ciphertexts: string[],
    contractAddresses: string[],
    userAddress: string,
    privateKey: string,
    publicKey: string,
    startTimestamp: number,
    durationDays: number,
    signature: string,
  ) {
    if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
    this.trace?.("[FhevmCore] decrypt called");

    return this.instance.decrypt(ciphertexts, contractAddresses, userAddress, privateKey, publicKey, startTimestamp, durationDays, signature);
  }

  public async createEIP712(contractAddresses: string[], keyPair: any): Promise<FhevmDecryptionSignatureType> {
    if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
    this.trace?.("[FhevmCore] createEIP712 called");

    const relayerInstance = await this.instance.getRelayerInstance()

    const startTimestamp = Math.floor(Date.now() / 1000);
    const eip712 = relayerInstance.createEIP712(
      keyPair.publicKey,
      contractAddresses,
      startTimestamp,
      this.durationDays
    );

    if (!this.context.wallet?.signTypedData) throw new Error("FhevmCore: Wallet is not provided. Call init() first.");
    const userAddress: string = this.context.wallet.address
    // 3. Sign using ethers Signer (signTypedData)
    const signature = await this.context.wallet.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      contractAddresses: contractAddresses as `0x${string}`[],
      startTimestamp,
      durationDays: this.durationDays,
      signature,
      eip712,
      userAddress: userAddress as `0x${string}`,
    };
  }

  public async publicDecrypt(ciphertext: string): Promise<string> {
    if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
    this.trace?.("[FhevmCore] publicDecrypt called");
    return this.instance.publicDecrypt(ciphertext);
  }

  public async generateKeypair(): Promise<any> {
    if (!this.instance) throw new Error("FhevmCore: SDK not initialized. Call init() first.");
    return this.instance.generateKeypair();
  }
}
