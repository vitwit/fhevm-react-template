import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { FhevmUniversalSDK } from "@fhevm-sdk";
const FhevmContext = createContext({ initialized: false });
export const FhevmProvider = ({ sdkConfig, wallet, children }) => {
    const [sdk, setSdk] = useState();
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState();
    useEffect(() => {
        const initSdk = async () => {
            try {
                const instance = new FhevmUniversalSDK(sdkConfig, wallet);
                await instance.init();
                setSdk(instance);
                setInitialized(true);
            }
            catch (err) {
                setError(err);
            }
        };
        initSdk();
    }, [sdkConfig, wallet]);
    return (_jsx(FhevmContext.Provider, { value: { sdk, initialized, error }, children: children }));
};
export const useFhevmContext = () => useContext(FhevmContext);
