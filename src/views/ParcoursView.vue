<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgression, FRESQUES, distanceMetres } from '../stores/progression'
import { useGeoloc } from '../composables/useGeoloc'
import CarteParcours from '../components/CarteParcours.vue'

const router = useRouter()
const progression = useProgression()
const { demarrer, position, erreur, precision, statut } = useGeoloc()

const annonce = ref('')

onMounted(() => {
  demarrer((fresqueId) => {
    const f = FRESQUES.find((x) => x.id === fresqueId)
    annonce.value = `Tampon obtenu : ${f?.nom ?? fresqueId}`
    setTimeout(() => { annonce.value = '' }, 6000)
  })
})

// Beyond 2 km the automatic stamp will never land: either not on site yet, or
// the placeholder coordinates in src/data/fresques.js are still in place.
const horsZone = computed(() => {
  if (!position.value) return false
  const d = FRESQUES.map((f) => distanceMetres(position.value, { lat: f.lat, lng: f.lng }))
  return Math.min(...d) > 2000
})

const statutTexte = computed(() => {
  if (erreur.value) return erreur.value
  if (statut.value === 'recherche') return 'Recherche du signal GPS…'
  if (horsZone.value) return 'Vous êtes loin du campus de Nouville'
  if (precision.value) return `Position suivie — précision ~${precision.value} m`
  return null
})
</script>

<template>
  <div class="explorer">
    <CarteParcours
      class="explorer__carte"
      plein
      :fresques="FRESQUES"
      :etats="progression.fresques"
      :position="position"
      @choisir="(id) => router.push({ name: 'tampon-detail', params: { id } })"
    />

    <div class="flottants">
      <p class="pastille pastille--compte">
        <b>{{ progression.nbTampons }}</b><span>/{{ FRESQUES.length }}</span>
      </p>

      <Transition name="surgir">
        <p v-if="annonce" class="pastille pastille--ok" role="status">✓ {{ annonce }}</p>
        <p
          v-else-if="statutTexte"
          class="pastille"
          :class="{ 'pastille--alerte': erreur }"
          role="status"
        >
          {{ statutTexte }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  position: relative;
  display: flex;
  min-height: 0;
}
.explorer__carte { flex: 1; min-height: 0; }

.flottants {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top, 0px));
  left: 12px;
  right: 92px;
  z-index: 600;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  pointer-events: none;
}

.pastille {
  max-width: 100%;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--encre);
  background: color-mix(in srgb, var(--papier-clair) 92%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--ligne-forte);
  box-shadow: var(--ombre-2);
}

.pastille--compte { font-family: var(--serif); padding: 0.3rem 0.8rem; }
.pastille--compte b { font-size: 1.15rem; }
.pastille--compte span { font-size: 0.8rem; color: var(--encre-douce); }

.pastille--ok {
  font-weight: 700;
  color: var(--vert-valide);
  background: color-mix(in srgb, var(--mousse-clair) 94%, transparent);
  border-color: var(--vert-valide);
}
.pastille--alerte {
  color: var(--rouge-tampon);
  background: color-mix(in srgb, var(--terre-clair) 94%, transparent);
  border-color: var(--rouge-tampon);
  border-radius: var(--rayon-s);
}

.surgir-enter-active,
.surgir-leave-active { transition: opacity 0.3s var(--doux), transform 0.3s var(--ressort); }
.surgir-enter-from,
.surgir-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
