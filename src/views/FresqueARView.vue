<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgression } from '../stores/progression'
import ScanneurAR from '../components/ScanneurAR.vue'

const route = useRoute()
const router = useRouter()
const progression = useProgression()

const id = route.params.id
const config = computed(() => progression.fresqueConfig(id))
const etat = computed(() => progression.fresques[id] ?? { tampon: false, fragments: [] })

function collecter(fragmentId) {
  progression.collecterFragment(id, fragmentId)
  if (progression.fresqueComplete(id)) {
    setTimeout(() => router.push({ name: 'microscopique', params: { id } }), 1200)
  }
}
</script>

<template>
  <ScanneurAR v-if="config" :fresque="config" :collectes="etat.fragments" @collecte="collecter" />
</template>
