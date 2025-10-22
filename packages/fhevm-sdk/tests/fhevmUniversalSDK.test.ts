import { describe, it, expect } from "vitest";
import { FhevmUniversalSDK } from "../src/core/FhevmUniversalSDK";

describe("FhevmUniversalSDK", () => {
    it("throws if initialized without wallet in Node environment", async () => {
        const sdk = new FhevmUniversalSDK({ /* dummy config */ } as any);

        await expect(sdk.init()).rejects.toThrow(
            "Node.js environment requires a wallet to be provided"
        );
    }, 20_000);
});
