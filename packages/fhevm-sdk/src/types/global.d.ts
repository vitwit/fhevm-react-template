import { FhevmRelayerSDKType } from "../core/internal/FhevmTypes";

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
