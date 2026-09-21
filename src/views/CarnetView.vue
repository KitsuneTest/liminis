<script setup>
import { useProgression, FRESQUES } from '../stores/progression'
const progression = useProgression()
// TODO (équipe carnet) : CarnetImprimable.vue + export PDF (html2canvas + jsPDF)
</script>

<template>
  <section>
    <h1>Mon carnet</h1>
    <article v-for="f in FRESQUES" :key="f.id">
      <h2>{{ f.nom }}</h2>
      <p>Tampon : {{ progression.fresques[f.id].tampon ? 'obtenu' : '—' }}</p>
      <p>Fragments : {{ progression.fresques[f.id].fragments.length }} / {{ f.nbFragments }}</p>
    </article>
    <button @click="progression.exporterJSON()">Sauvegarde technique (JSON)</button>
  </section>
</template>
