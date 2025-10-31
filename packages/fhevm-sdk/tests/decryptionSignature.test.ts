import { describe, it, expect } from "vitest";
import { FhevmDecryptionSignature } from "../src/core/FhevmDecryptionSignature";

describe("FhevmDecryptionSignature", () => {
  it("throws if no wallet is provided", () => {
    expect(() => new FhevmDecryptionSignature(undefined as any)).toThrow();
  });
});
