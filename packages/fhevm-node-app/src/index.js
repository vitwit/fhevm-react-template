import { FhevmUniversalSDK } from "@fhevm-sdk";
import { Wallet } from "ethers";
async function main() {
    // Generate a random Ethereum wallet
    const wallet = Wallet.fromPhrase("lazy flame file high bronze wave frog pencil unaware toddler tackle add");
    console.log("Generated Wallet Address:", wallet.address);
    console.log("Private Key (keep secret!):", wallet.privateKey);
    // SDK configuration
    const sdkConfig = {
        network: "devnet", // example network
    };
    const sdk = new FhevmUniversalSDK(sdkConfig, wallet);
    await sdk.init();
    console.log("Fhevm SDK initialized!");
    const message = "Hello FHEVM!";
    const ciphertext = await sdk.encrypt(message);
    console.log("Ciphertext:", ciphertext);
    const decrypted = await sdk.decrypt(ciphertext.ciphertext);
    console.log("Decrypted:", decrypted);
}
main().catch(console.error);
