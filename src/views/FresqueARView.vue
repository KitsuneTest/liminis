<script setup>
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'

const route = useRoute()
const progression = useProgression()
const id = route.params.id

// TODO (équipe AR) : remplacer par le composant SceneAR.vue (MindAR + A-Frame).
// Bouton de test en attendant, pour valider le câblage avec le store.
function simulerCollecte(n) { progression.collecterFragment(id, `frag-${n}`) }
</script>

<template>
  <section>
    <h1>Fresque : {{ id }}</h1>
    <p>Fragments collectés : {{ progression.fresques[id]?.fragments.length || 0 }}</p>

    <!-- zone de test tant que l'AR n'est pas branchée -->
    <button v-for="n in 4" :key="n" @click="simulerCollecte(n)">Fragment {{ n }}</button>

    <p v-if="progression.fresqueComplete(id)">
      <RouterLink :to="`/fresque/${id}/microscopique`">Voir la vision microscopique</RouterLink>
    </p>
  </section>
</template>
