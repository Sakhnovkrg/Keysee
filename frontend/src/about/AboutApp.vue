<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(async () => {
  window.postMessage({ payload: 'removeLoading' })
})
</script>
<template>
  <div class="header">
    <img style="width: 80px;" src="../assets/keysee.svg" class="logo" alt="Keysee logo" />
  </div>

  <p>
    <strong>Keysee</strong> is a free and open-source tool for visualizing keyboard and mouse input. Useful for tutorials and software demonstrations.
  </p>
  <div class="version">v0.9.2</div>

  <div class="links">
    <a href="https://sakhnovkrg.github.io/Keysee/" target="_blank">Website</a>
    <a href="https://github.com/Sakhnovkrg/Keysee" target="_blank">GitHub</a>
    <a href="https://discord.gg/2XUs6muFy4" target="_blank">Discord</a>
    <a href="https://www.paypal.com/paypalme/sakhnovkrg">Donate</a>
  </div>
</template>

<style>
html {
  font-size: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

body {
  font-family: 'Segoe UI', sans-serif;
  margin: 0;
  padding: 0 20px;
}

h1 {
  margin: 0;
}

.version {
  color: #aaa;
  font-size: 13px;
}

.links {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.links a {
  color: #00aaee;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
