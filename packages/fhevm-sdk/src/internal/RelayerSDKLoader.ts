import { SDK_CDN_URL } from "../utils/constants.js";
import { isBrowser } from "../utils/env.js";
import { TraceType } from "./FhevmTypes.js";

export class RelayerSDKLoader {
    private sdk: any;
    private trace?: TraceType;

    constructor({ trace }: { trace?: TraceType }) {
        this.trace = trace;
    }

    public async load(): Promise<void> {
        if (this.sdk) return;

        if (isBrowser()) {
            this.trace?.("[RelayerSDKLoader] Browser detected");

            if ((window as any).relayerSDK) {
                this.sdk = (window as any).relayerSDK;
                this.trace?.("[RelayerSDKLoader] Found existing window.relayerSDK");
                return;
            }

            await new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src = SDK_CDN_URL;
                script.async = true;
                script.onload = async () => {
                    if ((window as any).relayerSDK) {
                        this.sdk = (window as any).relayerSDK;
                        this.trace?.("[RelayerSDKLoader] SDK loaded successfully");
                        const result = await import("@zama-fhe/relayer-sdk/bundle");
                        this.sdk = result;
                        resolve();
                    } else {
                        reject(
                            new Error("RelayerSDKLoader: SDK loaded but window.relayerSDK missing")
                        );
                    }
                };
                script.onerror = (e) => reject(e);
                document.head.appendChild(script);
            });
        } else {
            this.trace?.("[RelayerSDKLoader] Node detected");
            const mod = await import("@zama-fhe/relayer-sdk/node");
            this.sdk = mod;
        }
    }

    public getSDK(): any {
        if (!this.sdk)
            throw new Error("RelayerSDKLoader: SDK not loaded. Call load() first.");
        return this.sdk;
    }
}
