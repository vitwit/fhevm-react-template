import { FhevmRelayerSDKType } from "../internal/FhevmTypes.ts";

/**
 * Extend the Window interface to include relayerSDK
 */
declare global {
    interface Window {
        relayerSDK: FhevmRelayerSDKType;
    }
}

// This makes it a module
export { };
