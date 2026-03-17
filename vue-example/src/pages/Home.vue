<template>
  <section class="home">
    <div class="home-card">
      <h2>Vue + Express Changelog Example</h2>
      <p>
        This demo renders the Vue components from <code>changelog-sdk/vue</code> and serves the
        backend routes from <code>changelog-sdk/express</code>.
      </p>
      <div class="home-actions">
        <RouterLink class="btn" to="/changelog">View public feed</RouterLink>
        <RouterLink class="btn btn-ghost" to="/changelog/login">Admin login</RouterLink>
        <RouterLink class="btn btn-ghost" to="/changelog/admin">Admin portal</RouterLink>
      </div>
      <p class="home-note">The admin portal requires authentication.</p>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
