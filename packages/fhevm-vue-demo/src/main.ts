import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.css";
import "./assets/main.css";

import { FhevmPlugin } from "@fhevm/vue";

const app = createApp(App);

// Example Sepolia config
app.use(FhevmPlugin, {
  network: "testnet",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  contractAddress: "0xYourFHECounterAddress",
  chainId: 11155111,
});

app.mount("#app");
