<script setup>
import { useProgression } from './stores/progression'
const progression = useProgression()
</script>

<template>
  <div class="app">
    <main><RouterView /></main>

    <nav class="nav">
      <RouterLink to="/parcours">Parcours</RouterLink>
      <RouterLink to="/carnet">Carnet</RouterLink>
      <RouterLink v-if="progression.pageFamilierDisponible" to="/familier">Familier</RouterLink>
      <RouterLink to="/a-propos">À propos</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; min-height: 100vh; }
main { flex: 1; padding: 1rem; }
.nav {
  display: flex; justify-content: space-around; padding: .75rem;
  border-top: 1px solid #ddd; background: #fff; position: sticky; bottom: 0;
}
.nav a { text-decoration: none; font-size: .9rem; }
.nav a.router-link-active { font-weight: 700; }
</style>
