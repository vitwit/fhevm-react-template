import { FhevmRelayerSDKType, FhevmWindowType, TraceType } from "./FhevmTypes";
import { SDK_CDN_URL } from "../../utils/constants";

/**
 * Loader class for the FHEVM Relayer SDK.
 * Dynamically injects the Relayer SDK script in browser environments.
 */
export class RelayerSDKLoader {
    private _trace?: TraceType;

    /**
     * @param options.trace Optional trace function for logging debug messages
     */
    constructor(options: { trace?: TraceType }) {
        this._trace = options.trace;
    }

    /**
     * Checks if the Relayer SDK is already loaded in the browser.
     */
    public isLoaded(): boolean {
        if (typeof window === "undefined") {
            throw new Error("RelayerSDKLoader: can only be used in the browser.");
        }
        return isFhevmWindowType(window, this._trace);
    }

    /**
     * Loads the Relayer SDK dynamically in the browser.
     * Returns a promise that resolves once the SDK is available.
     */
    public load(): Promise<void> {
        this._trace?.("[RelayerSDKLoader] load...");

        if (typeof window === "undefined") {
            return Promise.reject(
                new Error("RelayerSDKLoader: can only be used in the browser.")
            );
        }

        // Already loaded
        if ("relayerSDK" in window) {
            if (!isFhevmRelayerSDKType(window.relayerSDK, this._trace)) {
                throw new Error("RelayerSDKLoader: invalid relayerSDK object on window.");
            }
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Avoid adding duplicate scripts
            const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
            if (existingScript) {
                if (!isFhevmWindowType(window, this._trace)) {
                    reject(new Error("RelayerSDKLoader: invalid relayerSDK object on window."));
                }
                resolve();
                return;
            }

            // Inject script
            const script = document.createElement("script");
            script.src = SDK_CDN_URL;
            script.type = "text/javascript";
            script.async = true;

            script.onload = () => {
                if (!isFhevmWindowType(window, this._trace)) {
                    reject(new Error("RelayerSDKLoader: failed to initialize relayerSDK."));
                    return;
                }
                this._trace?.("[RelayerSDKLoader] SDK loaded successfully");
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`RelayerSDKLoader: Failed to load SDK from ${SDK_CDN_URL}`));
            };

            this._trace?.("[RelayerSDKLoader] appending script to DOM...");
            document.head.appendChild(script);
        });
    }
}

/**
 * Type guard to check if an object is a valid FhevmRelayerSDKType
 */
export function isFhevmRelayerSDKType(
    obj: unknown,
    trace?: TraceType
): obj is FhevmRelayerSDKType {
    if (!obj || typeof obj !== "object") {
        trace?.("RelayerSDKLoader: object is not valid");
        return false;
    }

    const sdk = obj as Record<string, unknown>;
    if (typeof sdk.initSDK !== "function") return false;
    if (typeof sdk.createInstance !== "function") return false;
    if ("__initialized__" in sdk && typeof sdk.__initialized__ !== "boolean") return false;

    return true;
}

/**
 * Type guard to check if window contains a valid relayerSDK
 */
export function isFhevmWindowType(win: unknown, trace?: TraceType): win is FhevmWindowType {
    if (!win || typeof win !== "object") {
        trace?.("RelayerSDKLoader: window is not an object");
        return false;
    }

    if (!("relayerSDK" in win)) {
        trace?.("RelayerSDKLoader: window does not contain relayerSDK");
        return false;
    }

    return isFhevmRelayerSDKType((win as FhevmWindowType).relayerSDK, trace);
}
