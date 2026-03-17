<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header-inner">
        <h1>Changelog SDK</h1>
        <nav class="app-nav">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/changelog">Changelog</RouterLink>
          <RouterLink to="/changelog/login">Admin Login</RouterLink>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
