import { Auth } from "./auth.js";

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

    /** 
   * Signs an EIP-712 typed message 
   * (used for structured signatures like user decryption requests)
   */
    signTypedData?: (
        domain: Record<string, any>,
        types: Record<string, any>,
        message: Record<string, any>
    ) => Promise<string>;
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
    prepareEncryptionBuffer: (userAddress: string) => Promise<RelayerEncryptedInput>;

    /** Decrypts a ciphertext string */
    decrypt: (cyphertexts: string[],
        userAddress: string,
        signature: string) => Promise<FhevmDecryptionResult>;

    /** Returns the public key for encryption */
    getPublicKey: () => Promise<string>;

    publicDecrypt(ciphertext: string): Promise<string>

    getRelayerInstance(): Promise<FhevmRelayerInstance>
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

export type HandleContractPair = {
    handle: Uint8Array | string;
    contractAddress: string;
};

export interface FhevmRelayerInstance {
    createEncryptedInput: (
        contractAddress: string,
        userAddress: string,
    ) => RelayerEncryptedInput; // encrypt

    publicDecrypt(ciphertext: string): Promise<string>;  // decrypt

    userDecrypt(
        handles: HandleContractPair[],
        privateKey: string,
        publicKey: string,
        signature: string,
        contractAddresses: string[],
        userAddress: string,
        startTimestamp: string | number,
        durationDays: string | number,
    ): Promise<string>;    // alternative decrypt for user

    getPublicKey(): Promise<string>;

    generateKeypair(): Promise<any>;                     // optional, return type can be defined

    createEIP712(...args: any[]): any;                  // EIP712 helper

    getPublicParams(): any;                             // returns network/public params
}

export type RelayerEncryptedInput = {
    addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
    add8: (value: number | bigint) => RelayerEncryptedInput;
    add16: (value: number | bigint) => RelayerEncryptedInput;
    add32: (value: number | bigint) => RelayerEncryptedInput;
    add64: (value: number | bigint) => RelayerEncryptedInput;
    add128: (value: number | bigint) => RelayerEncryptedInput;
    add256: (value: number | bigint) => RelayerEncryptedInput;
    addAddress: (value: string) => RelayerEncryptedInput;
    getBits: () => EncryptionTypes[];
    encrypt: (options?: { auth?: Auth }) => Promise<{
        handles: Uint8Array[];
        inputProof: Uint8Array;
    }>;
};

export const ENCRYPTION_TYPES = {
    1: 0, // ebool takes 2 encrypted bits
    8: 2,
    16: 3,
    32: 4,
    64: 5,
    128: 6,
    160: 7,
    256: 8,
    512: 9,
    1024: 10,
    2048: 11,
};

export type EncryptionTypes = keyof typeof ENCRYPTION_TYPES;

export type EncryptionInput =
    | { type: "bool"; value: boolean | number | bigint }
    | { type: "u8"; value: number | bigint }
    | { type: "u16"; value: number | bigint }
    | { type: "u32"; value: number | bigint }
    | { type: "u64"; value: number | bigint }
    | { type: "u128"; value: number | bigint }
    | { type: "u256"; value: number | bigint }
    | { type: "address"; value: string };
