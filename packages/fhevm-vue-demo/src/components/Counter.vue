<template>
  <div>
    <p v-if="loading">🕓 Connecting wallet...</p>

    <div v-else>
      <p>Connected: {{ address }}</p>
      <h2>{{ counter ?? "…" }}</h2>

      <div class="buttons">
        <button @click="decrement" :disabled="busy">➖ Decrement</button>
        <button @click="increment" :disabled="busy">➕ Increment</button>
      </div>

      <div class="buttons">
        <button @click="getCounter" :disabled="busy">🔄 Refresh</button>
      </div>

      <p v-if="busy">⏳ Please wait…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { ethers } from "ethers";
import { useFhevm, useEncrypt } from "@fhevm/vue";
import { abis } from "@fhevm/shared";
import { BrowserProvider, Contract } from "ethers";


const { sdk, signer, address, loading } = useFhevm();
const { encrypt } = useEncrypt();

const counter = ref<number | null>(null);
const busy = ref(false);

// Example FHE Counter ABI
const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];
let contract: ethers.Contract | null = null;

watchEffect(async () => {
  if (window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    const signerInstance = await provider.getSigner();

    const FHECounter = abis.deployedContracts["11155111"]["FHECounter"];
    contract = new Contract(FHECounter.address, FHECounter.abi, signerInstance);
  }
});

async function getCounter() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const encrypted = await contract.getCount();
    const decrypted = await sdk.value.decrypt([encrypted], address.value, [FHECounter.address]);
    counter.value = Number(decrypted.plaintext);
  } catch (err) {
    console.error("getCounter failed", err);
  } finally {
    busy.value = false;
  }
}

async function increment() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const { handles, inputProof } = await encrypt([{ type: "u32", value: 1 }]);
    const tx = await contract.increment(handles[0], inputProof);
    await tx.wait();
    await getCounter();
  } catch (err) {
    console.error("increment failed", err);
  } finally {
    busy.value = false;
  }
}

async function decrement() {
  if (!sdk.value || !contract || !address.value) return;
  busy.value = true;

  try {
    const { handles, inputProof } = await encrypt([{ type: "u32", value: 1 }]);
    const tx = await contract.decrement(handles[0], inputProof);
    await tx.wait();
    await getCounter();
  } catch (err) {
    console.error("decrement failed", err);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}
</style>
