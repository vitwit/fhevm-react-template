<template>
  <div class="container">
    <h1>🔐 Encrypted Counter (Vue)</h1>
    <Counter />
  </div>
</template>

<script setup lang="ts">
import Counter from "./components/Counter.vue";
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
}
</style>
