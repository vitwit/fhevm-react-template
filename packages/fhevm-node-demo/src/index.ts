
import { FhevmUniversalSDK } from "@fhevm/sdk";
import { Wallet, ethers } from "ethers";
import { abis } from "@fhevm/shared";

import dotenv from "dotenv";
dotenv.config();


async function main() {
  const mnemonic = process.env.SEED_PHRASE!;
  const infuraKey = process.env.INFURA_API_KEY!;

  if (!mnemonic || !infuraKey) {
    throw new Error("❌ Missing SEED_PHRASE or INFURA_API_KEY in .env");
  }

  // Restore wallet from mnemonic
  const wallet = Wallet.fromPhrase(mnemonic);
  console.log("Wallet:", wallet.address);

  const RPC_URL = `https://sepolia.infura.io/v3/${infuraKey}`;
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Attach provider to wallet
  const walletWithProvider = wallet.connect(provider);

  // Load contract
  const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];
  const { address, abi } = FHECounter;

  // Create contract using provider-connected signer
  const contract = new ethers.Contract(address, abi, walletWithProvider);

  // Initialize SDK
  console.log("Initializing sdk...")
  const sdk = new FhevmUniversalSDK(undefined,walletWithProvider);
  await sdk.init(address);
  console.log("SDK initialized...")

  const handles = await sdk.encryptInputs(wallet.address, [
    { type: "u32", value: 1 },
  ]);

  console.log("Submitting increment transaction...")
  const tx = await contract.increment(handles.handles[0], handles.inputProof);
  await tx.wait();
  console.log("Increment transaction hash:", tx.hash);

  let counter = await contract.getCount();
  console.log(`Counter ciphertext after increment = `, counter);

  let decrypted = await sdk.decrypt([counter], wallet.address, [address]);

  console.log(`Encrypted counter = `, decrypted.plaintext[counter]);

  console.log("Submitting decrement transaction...")
  const tx1 = await contract.decrement(handles.handles[0], handles.inputProof);
  await tx1.wait();
  console.log("Decrement transaction hash:", tx1.hash);

  counter = await contract.getCount();
  console.log(`Counter ciphertext after decrement = `, counter);

  decrypted = await sdk.decrypt([counter], wallet.address, [address]);

  console.log(`Decrypted counter = `, decrypted.plaintext[counter]);
}

main().catch(console.error);
