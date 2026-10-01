<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'
import { ECHELLES } from '../data/echelles'
import VisionEchelles from '../components/VisionEchelles.vue'
import Icone from '../components/Icone.vue'

const route = useRoute()
const progression = useProgression()
const config = computed(() => progression.fresqueConfig(route.params.id))
const echelles = computed(() => ECHELLES[route.params.id] ?? [])
const limite = computed(() => progression.niveauxDebloques(route.params.id) - 1)
const restants = computed(() => echelles.value.length - 1 - limite.value)
const depart = Math.min(Number(route.query.niveau) || 0, limite.value)
const depuisCarnet = route.query.depuis === 'carnet'
const retour = depuisCarnet ? `/carnet/tampons/${route.params.id}` : `/fresque/${route.params.id}`

const vision = ref(null)
const niveau = ref(0)
const courante = computed(() => echelles.value[niveau.value])
</script>

<template>
  <section class="ecran">
    <VisionEchelles
      v-if="config && echelles.length"
      ref="vision"
      :fresque="config"
      :echelles="echelles"
      :limite="limite"
      :depart="depart"
      :decalage="0.12"
      @niveau="niveau = $event"
    />

    <header class="haut">
      <RouterLink class="rond" :to="retour" :aria-label="depuisCarnet ? 'Retour au carnet' : 'Retour à la fresque'">
        <Icone nom="chevron-gauche" :taille="22" />
      </RouterLink>
      <p class="haut__titre">{{ config?.nom }} <span>· du visible à la molécule</span></p>
      <p class="taille">{{ courante?.taille }}</p>
    </header>

    <div class="bas">
      <p class="geste">Zoomer ou dézoomer et glissez pour tourner autour de l'élément</p>

      <div v-if="courante" class="lecture">
        <h2>{{ courante.nom }}</h2>
        <p>{{ courante.texte }}</p>
      </div>

      <div class="crans">
        <button
          v-for="(e, i) in echelles"
          :key="e.nom"
          class="cran"
          :class="{ 'cran--actif': i === niveau }"
          type="button"
          :disabled="i > limite"
          :aria-label="i > limite ? 'Échelle encore verrouillée' : e.taille"
          @click="vision?.aller(i)"
        >
          <Icone v-if="i > limite" nom="cadenas" :taille="12" />
          <template v-else>{{ e.taille }}</template>
        </button>
      </div>

      <RouterLink
        v-if="restants > 0 && !depuisCarnet"
        class="bouton bouton--accent bouton--bloc"
        :to="`/fresque/${route.params.id}`"
      >
        Chercher le fragment suivant ({{ restants }} {{ restants > 1 ? 'échelles' : 'échelle' }} à révéler)
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.ecran {
  position: relative;
  overflow: hidden;
  background: #17142f;
  color: var(--papier);
}

.haut,
.bas {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  padding-inline: 1rem;
}

.haut {
  top: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: calc(0.8rem + env(safe-area-inset-top, 0px));
  padding-bottom: 1.6rem;
  background: linear-gradient(rgba(23, 20, 47, 0.75), transparent);
  pointer-events: none;
}
.haut > * { pointer-events: auto; }
.haut__titre { flex: 1; min-width: 0; margin: 0; font: 600 0.95rem/1.2 var(--serif); }
.haut__titre span { font-style: italic; font-weight: 400; opacity: 0.75; }

.rond {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(251, 240, 222, 0.16);
  color: var(--papier);
}

.taille {
  flex: none;
  margin: 0;
  font: 700 0.75rem/1 var(--sans);
  letter-spacing: 0.1em;
  color: var(--encre);
  background: var(--papier-clair);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
}

.bas {
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding-top: 2.4rem;
  padding-bottom: 0.9rem;
  background: linear-gradient(transparent, rgba(23, 20, 47, 0.82) 30%);
  pointer-events: none;
}
.bas > * { pointer-events: auto; }

.geste { margin: 0; text-align: center; font-size: 0.72rem; opacity: 0.7; pointer-events: none; }

.lecture h2 { margin: 0 0 0.25rem; font-size: 1.15rem; color: var(--papier-clair); }
.lecture p { margin: 0; font-size: 0.82rem; line-height: 1.45; opacity: 0.9; }

.crans { display: flex; gap: 0.3rem; }
.cran {
  flex: 1;
  display: grid;
  place-items: center;
  font: 700 0.68rem/1 var(--sans);
  padding: 0.5rem 0.2rem;
  border-radius: var(--rayon-s);
  border: 1.5px solid rgba(251, 240, 222, 0.35);
  background: rgba(251, 240, 222, 0.08);
  color: var(--papier);
  cursor: pointer;
}
.cran:disabled { cursor: default; opacity: 0.5; }
.cran--actif {
  color: var(--encre);
  background: var(--papier-clair);
  border-color: var(--papier-clair);
}
</style>
