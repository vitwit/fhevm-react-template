import { describe, it, expect } from "vitest";
import * as core from "../src/core";
import * as storage from "../src/core/storage";
import * as internal from "../src/core/internal";

describe("Core SDK exports", () => {
    it("core module should be present", () => {
        expect(core).toBeTruthy();
    });

    it("internal exports should be present", () => {
        expect(internal).toBeTruthy();
    });

    it("storage exports should be present", () => {
        expect(storage).toBeTruthy();
    });
});
