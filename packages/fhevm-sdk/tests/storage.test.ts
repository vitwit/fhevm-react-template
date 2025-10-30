import { describe, it, expect } from "vitest";
import { GenericStringStorage } from "../src/modules/storage/GenericStringStorage";

describe("GenericStringStorage", () => {
  it("sets, gets, and removes values correctly", async () => {
    const storage = new GenericStringStorage();

    await storage.set("key", "value");
    const val1 = await storage.get("key");
    expect(val1).toBe("value");

    await storage.remove("key");
    const val2 = await storage.get("key");
    expect(val2).toBe(null);
  });
});
