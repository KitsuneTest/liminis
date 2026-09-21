<script setup>
import { onMounted, ref } from 'vue'
import { useProgression, FRESQUES } from '../stores/progression'
import { useGeoloc } from '../composables/useGeoloc'

const progression = useProgression()
const { demarrer, erreur, precision } = useGeoloc()
const message = ref('')

onMounted(() => {
  demarrer((fresqueId) => { message.value = `Tampon obtenu : ${fresqueId} !` })
})
// TODO (équipe carte) : intégrer ici le composant Carte.vue (Leaflet)
</script>

<template>
  <section>
    <h1>Parcours</h1>
    <p v-if="erreur" class="err">Géolocalisation : {{ erreur }}</p>
    <p v-else-if="precision">Précision GPS : ~{{ precision }} m</p>
    <p v-if="message" class="ok">{{ message }}</p>

    <ul>
      <li v-for="f in FRESQUES" :key="f.id">
        {{ f.nom }} —
        <strong>{{ progression.fresques[f.id].tampon ? 'visitée ✓' : 'à visiter' }}</strong>
        <RouterLink :to="`/fresque/${f.id}`"> ouvrir l'AR</RouterLink>
      </li>
    </ul>
    <p>Tampons : {{ progression.nbTampons }} / {{ FRESQUES.length }}</p>
  </section>
</template>

<style scoped>
.err { color: #b5384d; }
.ok { color: #1a7f4b; font-weight: 700; }
</style>
