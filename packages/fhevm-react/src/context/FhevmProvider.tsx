import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FhevmUniversalSDK } from "@fhevm-sdk";

interface FhevmContextType {
    sdk?: FhevmUniversalSDK;
    initialized: boolean;
    error?: Error;
}

const FhevmContext = createContext<FhevmContextType>({ initialized: false });

interface FhevmProviderProps {
    sdkConfig: ConstructorParameters<typeof FhevmUniversalSDK>[0];
    wallet?: ConstructorParameters<typeof FhevmUniversalSDK>[1];
    children: ReactNode;
}

export const FhevmProvider: React.FC<FhevmProviderProps> = ({ sdkConfig, wallet, children }) => {
    const [sdk, setSdk] = useState<FhevmUniversalSDK>();
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const initSdk = async () => {
            try {
                const instance = new FhevmUniversalSDK(sdkConfig, wallet);
                await instance.init();
                setSdk(instance);
                setInitialized(true);
            } catch (err) {
                setError(err as Error);
            }
        };

        initSdk();
    }, [sdkConfig, wallet]);

    return (
        <FhevmContext.Provider value={{ sdk, initialized, error }}>
            {children}
        </FhevmContext.Provider>
    );
};

export const useFhevmContext = () => useContext(FhevmContext);
