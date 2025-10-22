import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FhevmProvider } from "../src/context/FhevmProvider";
import { useFhevm } from "../src/hooks/useFhevm";

// Dummy component to test hook usage
const TestComponent = () => {
    const sdk = useFhevm();
    return <div data-testid="sdk">{sdk ? "SDK ready" : "SDK not ready"}</div>;
};

describe("Fhevm React Module", () => {
    it("renders provider and hook", async () => {
        // Render provider with empty config
        render(
            <FhevmProvider sdkConfig={{}}>
                <TestComponent />
            </FhevmProvider>
        );

        // Wait for initialization
        const sdkElement = await screen.findByTestId("sdk");
        expect(sdkElement.textContent).toBe("SDK ready");
    });
});
