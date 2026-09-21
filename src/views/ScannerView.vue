<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgression, FRESQUES, distanceMetres } from '../stores/progression'
import { useGeoloc } from '../composables/useGeoloc'

const router = useRouter()
const progression = useProgression()
const { demarrer, position, statut } = useGeoloc()

onMounted(() => demarrer())

const parDistance = computed(() => {
  if (!position.value) return FRESQUES.map((f) => ({ f, d: null }))
  return FRESQUES.map((f) => ({
    f,
    d: distanceMetres(position.value, { lat: f.lat, lng: f.lng }),
  })).sort((a, b) => a.d - b.d)
})

const proche = computed(() => {
  const [premier] = parDistance.value
  return premier?.d != null && premier.d < 60 ? premier.f : null
})

function formater(m) {
  if (m == null) return null
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Scanner</p>
      <h1 class="titre-chapitre">Quelle fresque ?</h1>
    </header>

    <div v-if="proche" class="feuille proposition" :style="{ '--teinte': `var(--${proche.couleur})` }">
      <img
        class="proposition__photo"
        :src="proche.photo"
        :style="{ objectPosition: proche.cadrage }"
        :alt="`Fresque ${proche.nom}`"
      />
      <div class="proposition__texte">
        <p class="surtitre">Vous y êtes</p>
        <h2>{{ proche.nom }}</h2>
        <p class="legende">{{ proche.lieu }}</p>
      </div>
      <RouterLink class="bouton bouton--accent bouton--bloc" :to="`/fresque/${proche.id}`">
        Ouvrir la caméra
      </RouterLink>
    </div>

    <p v-else-if="statut === 'recherche'" class="legende centre">
      Recherche de la fresque la plus proche…
    </p>
    <p v-else class="legende centre">
      Aucune fresque à moins de 60 m. Choisissez-en une pour ouvrir quand même la
      caméra.
    </p>

    <ul class="liste">
      <li v-for="{ f, d } in parDistance" :key="f.id">
        <button
          class="ligne"
          :style="{ '--teinte': `var(--${f.couleur})` }"
          type="button"
          @click="router.push(`/fresque/${f.id}`)"
        >
          <img class="ligne__photo" :src="f.photo" :style="{ objectPosition: f.cadrage }" alt="" />
          <span class="ligne__texte">
            <span class="ligne__nom">{{ f.nom }}</span>
            <span class="ligne__lieu">{{ f.lieu }}</span>
          </span>
          <span class="ligne__meta">
            <span v-if="d != null" class="puce puce--attente puce--mesure">{{ formater(d) }}</span>
            <span class="ligne__compte">
              {{ progression.fresques[f.id].fragments.length }}/{{ f.nbFragments }}
            </span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.centre { text-align: center; }

.proposition {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-left: 4px solid var(--teinte);
}
.proposition__photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--rayon-s);
}
.proposition__texte h2 { margin-top: 2px; }

.liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }

.ligne {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--ligne);
  border-left: 3px solid var(--teinte);
  border-radius: var(--rayon-s);
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s var(--doux);
}
.ligne:active { background: var(--surface-2); }

.ligne__photo {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: var(--rayon-xs);
  object-fit: cover;
}
.ligne__texte { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ligne__nom { font-family: var(--serif); font-size: 1rem; font-weight: 600; }
.ligne__lieu { font-size: 0.72rem; color: var(--encre-pale); }

.ligne__meta { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.ligne__compte { font-size: 0.7rem; color: var(--encre-douce); font-weight: 650; }
</style>
