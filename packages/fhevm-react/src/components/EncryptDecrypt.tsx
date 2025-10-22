import React, { useState } from "react";
import { useFhevm } from "../hooks/useFhevm";

export const EncryptDecrypt: React.FC = () => {
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

    return (
        <div className="space-y-4">
            <div>
                <input
                    type="text"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Enter text"
                />
                <button onClick={handleEncrypt}>Encrypt</button>
            </div>

            <div>
                <input type="text" value={ciphertext} readOnly placeholder="Ciphertext" />
                <button onClick={handleDecrypt}>Decrypt</button>
            </div>

            <div>
                <label>Decrypted:</label>
                <div>{decrypted}</div>
            </div>
        </div>
    );
};
