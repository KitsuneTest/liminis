<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'
import { ECHELLES } from '../data/echelles'
import VisionEchelles from '../components/VisionEchelles.vue'

const route = useRoute()
const progression = useProgression()
const config = computed(() => progression.fresqueConfig(route.params.id))
const echelles = computed(() => ECHELLES[route.params.id] ?? [])

const vision = ref(null)
const niveau = ref(0)
const courante = computed(() => echelles.value[niveau.value])
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Étape 3 — au plus près</p>
      <h1 class="titre-chapitre">Vision d'échelles</h1>
      <p class="legende sous">{{ config?.nom }} — du visible à la molécule</p>
    </header>

    <div class="hublot">
      <VisionEchelles
        v-if="config && echelles.length"
        ref="vision"
        :fresque="config"
        :echelles="echelles"
        @niveau="niveau = $event"
      />
      <div class="hublot__cadre"></div>
      <p class="hublot__taille">{{ courante?.taille }}</p>
    </div>

    <p class="geste">Pincez pour zoomer · glissez pour tourner</p>

    <div v-if="courante" class="feuille lecture">
      <h2>{{ courante.nom }}</h2>
      <p class="legende">{{ courante.texte }}</p>
    </div>

    <div class="crans">
      <button
        v-for="(e, i) in echelles"
        :key="e.nom"
        class="cran"
        :class="{ 'cran--actif': i === niveau }"
        type="button"
        @click="vision?.aller(i)"
      >{{ e.taille }}</button>
    </div>

    <RouterLink class="retour" :to="`/fresque/${route.params.id}`">← Retour à la fresque</RouterLink>
  </section>
</template>

<style scoped>
.sous { font-family: var(--serif); font-style: italic; font-size: 1rem; margin-top: 0.2rem; }

.hublot {
  position: relative;
  aspect-ratio: 1;
  margin: 0 auto;
  width: min(100%, 360px, 52svh);
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--encre);
  box-shadow: var(--ombre-carte);
  background: #17142f;
}

.hublot__cadre {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 40px rgba(23, 20, 47, 0.7);
  pointer-events: none;
}
.hublot__taille {
  position: absolute;
  bottom: 9%;
  left: 50%;
  transform: translateX(-50%);
  font: 700 0.75rem/1 var(--sans);
  letter-spacing: 0.1em;
  color: var(--encre);
  background: var(--papier-clair);
  border: 2px solid var(--encre);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  pointer-events: none;
}

.geste {
  text-align: center;
  font-size: 0.75rem;
  color: var(--encre-pale);
}

.lecture { text-align: center; }

.crans { display: flex; justify-content: space-between; gap: 0.3rem; }
.cran {
  flex: 1;
  font: 700 0.68rem/1 var(--sans);
  padding: 0.45rem 0.2rem;
  border-radius: var(--rayon-s);
  border: 1.5px solid var(--kraft);
  background: var(--papier-clair);
  color: var(--encre-pale);
  cursor: pointer;
}
.cran--actif {
  color: var(--papier-clair);
  background: var(--encre);
  border-color: var(--encre);
}

.retour {
  align-self: center;
  font-size: 0.85rem;
  color: var(--encre-douce);
  text-decoration: none;
  border-bottom: 1px dashed var(--kraft);
}
</style>
