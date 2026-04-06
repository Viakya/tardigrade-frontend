<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Global overrides — tokens & shared styles are in base.css + main.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  width: 100%;
  min-height: 100vh;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background-color: var(--bg-page);
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
