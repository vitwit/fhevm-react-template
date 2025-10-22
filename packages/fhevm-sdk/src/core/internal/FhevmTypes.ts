/**
 * A generic trace function used for logging debug messages.
 */
export type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

/**
 * Interface representing the FHEVM Relayer SDK.
 * This is the object exposed by the @zama-fhe/relayer-sdk in the browser.
 */
export interface FhevmRelayerSDKType {
    /** Initializes the SDK, must be called before usage */
    initSDK: () => Promise<void>;

    /** Creates a new instance of the relayer SDK with optional configuration */
    createInstance: (config?: Record<string, unknown>) => Promise<unknown>;

    /** Optional configuration for the Sepolia test network */
    SepoliaConfig?: Record<string, unknown>;

    /** Indicates whether the SDK has been initialized */
    __initialized__?: boolean;
}

/**
 * Extended Window interface that includes the relayerSDK object.
 */
export interface FhevmWindowType extends Window {
    relayerSDK: FhevmRelayerSDKType;
}

/**
 * Configuration object for initializing the FHEVM SDK.
 */
export interface FhevmConfig {
    /** Target network, e.g., "sepolia" */
    network?: string;

    /** RPC endpoint URL */
    rpcUrl?: string;

    /** Relayer endpoint URL */
    relayerUrl?: string;

    /** Enable debug logs */
    debug?: boolean;
}

/**
 * A public/private key pair for FHEVM encryption/decryption.
 */
export interface FhevmKeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Abstract wallet interface used by the SDK.
 * Can be implemented for browser wallets (MetaMask) or Node wallets.
 */
export interface FhevmWallet {
    /** Wallet address */
    address: string;

    /** Signs a message using the wallet's private key */
    signMessage: (message: string | Uint8Array) => Promise<string>;
}

/**
 * Result of an encryption operation.
 */
export interface FhevmEncryptionResult {
    /** The ciphertext as a string */
    ciphertext: string;

    /** Optional initialization vector */
    iv?: string;
}

/**
 * Result of a decryption operation.
 */
export interface FhevmDecryptionResult {
    /** The plaintext string */
    plaintext: string;
}

/**
 * A high-level FHEVM instance that provides encryption/decryption and public key access.
 */
export interface FhevmInstance {
    /** Encrypts a string */
    encrypt: (data: string) => Promise<FhevmEncryptionResult>;

    /** Decrypts a ciphertext string */
    decrypt: (ciphertext: string) => Promise<FhevmDecryptionResult>;

    /** Returns the public key for encryption */
    getPublicKey: () => Promise<string>;
}

/**
 * Context object passed throughout the SDK, containing relayer, wallet, and config.
 */
export interface FhevmSDKContext {
    /** Optional relayer SDK instance */
    relayerSDK?: FhevmRelayerSDKType;

    /** Optional wallet adapter */
    wallet?: FhevmWallet;

    /** SDK configuration */
    config: FhevmConfig;
}

export interface FhevmRelayerInstance {
  encrypt(data: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
  getPublicKey(): Promise<string>;
}
