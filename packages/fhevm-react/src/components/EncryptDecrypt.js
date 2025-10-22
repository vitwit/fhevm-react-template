import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useFhevm } from "../hooks/useFhevm";
export const EncryptDecrypt = () => {
    const sdk = useFhevm();
    const [plaintext, setPlaintext] = useState("");
    const [ciphertext, setCiphertext] = useState("");
    const [decrypted, setDecrypted] = useState("");
    const handleEncrypt = async () => {
        const result = await sdk.encrypt(plaintext);
        setCiphertext(result.ciphertext);
    };
    const handleDecrypt = async () => {
        const result = await sdk.decrypt(ciphertext);
        setDecrypted(result.plaintext);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("input", { type: "text", value: plaintext, onChange: (e) => setPlaintext(e.target.value), placeholder: "Enter text" }), _jsx("button", { onClick: handleEncrypt, children: "Encrypt" })] }), _jsxs("div", { children: [_jsx("input", { type: "text", value: ciphertext, readOnly: true, placeholder: "Ciphertext" }), _jsx("button", { onClick: handleDecrypt, children: "Decrypt" })] }), _jsxs("div", { children: [_jsx("label", { children: "Decrypted:" }), _jsx("div", { children: decrypted })] })] }));
};
