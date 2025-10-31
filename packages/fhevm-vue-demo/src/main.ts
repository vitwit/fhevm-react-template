import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.css";
import "./assets/main.css";

import { FhevmPlugin } from "@fhevm/vue";

const app = createApp(App);

// Example Sepolia config
app.use(FhevmPlugin, {
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  contractAddress: "0x2F39E2bfb4d5c8d6e5503F5103C5411Ae583A032",
  chainId: 11155111,
});

app.mount("#app");
