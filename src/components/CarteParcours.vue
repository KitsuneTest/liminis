<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CENTRE_PARCOURS } from '../data/fresques'
import { etatMarqueur } from '../lib/statutFresque'

const props = defineProps({
  fresques: { type: Array, required: true },
  etats: { type: Object, required: true },
  position: { type: Object, default: null },
  selection: { type: String, default: null },
})

const emit = defineEmits(['choisir'])

const conteneur = ref(null)
const carte = shallowRef(null)
const tuilesOk = ref(true)

let coucheMarqueurs = null
let marqueurUtilisateur = null

const SVG = {
  cadenas:
    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  oeil: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  tampon: '<path d="M9 3h6l-1 7h-4Z"/><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4Z"/><path d="M5 21h14"/>',
}

function iconeFresque(fresque, etat, choisie) {
  return L.divIcon({
    className: 'marqueur-liminis',
    html: `
      <div class="repere repere--${etat} ${choisie ? 'repere--choisi' : ''}" style="--teinte:var(--${fresque.couleur})">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG[etat]}</svg>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

const iconeUtilisateur = () =>
  L.divIcon({
    className: 'marqueur-liminis',
    html: '<div class="moi"><span></span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

function dessinerFresques() {
  if (!carte.value) return
  coucheMarqueurs.clearLayers()
  props.fresques.forEach((f) => {
    const etat = etatMarqueur(f, props.etats[f.id], props.position)
    L.marker([f.lat, f.lng], {
      icon: iconeFresque(f, etat, props.selection === f.id),
      keyboard: true,
      alt: f.nom,
    })
      .addTo(coucheMarqueurs)
      .on('click', () => emit('choisir', f.id))
  })
}

onMounted(() => {
  const map = L.map(conteneur.value, {
    center: [CENTRE_PARCOURS.lat, CENTRE_PARCOURS.lng],
    zoom: CENTRE_PARCOURS.zoom,
    zoomControl: false,
    attributionControl: true,
  })
  carte.value = map

  const tuiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '© OpenStreetMap',
    crossOrigin: true,
  }).addTo(map)
  tuiles.on('tileerror', () => { tuilesOk.value = false })
  tuiles.on('tileload', () => { tuilesOk.value = true })

  coucheMarqueurs = L.layerGroup().addTo(map)
  dessinerFresques()

  // In a flex layout the container is still 0 px on mount: remeasure once painted.
  requestAnimationFrame(() => map.invalidateSize())
})

onBeforeUnmount(() => {
  carte.value?.remove()
  carte.value = null
})

watch(() => [props.etats, props.selection, props.position], dessinerFresques, { deep: true })

watch(
  () => props.position,
  (pos) => {
    if (!carte.value || !pos) return
    const latlng = [pos.lat, pos.lng]
    if (!marqueurUtilisateur) {
      marqueurUtilisateur = L.marker(latlng, {
        icon: iconeUtilisateur(),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(carte.value)
    } else {
      marqueurUtilisateur.setLatLng(latlng)
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="carte-bloc">
    <div ref="conteneur" class="carte" role="application" aria-label="Carte du parcours"></div>
    <p v-if="!tuilesOk" class="carte-hors-ligne">Fond de carte indisponible hors-ligne</p>
  </div>
</template>

<style scoped>
.carte-bloc {
  position: relative;
  display: flex;
  min-height: 0;
  background: var(--papier);
}
.carte { flex: 1; min-height: 0; background: var(--papier); }

.carte-hors-ligne {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 500;
  font: 400 0.68rem/1.3 var(--mono);
  color: var(--encre-pale);
}
</style>

<!-- Leaflet injects its icons outside Vue's scope: these styles must be global. -->
<style>
.marqueur-liminis { background: none; border: none; }


.repere {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--encre-pale);
  background: color-mix(in srgb, var(--papier-clair) 55%, transparent);
  border: 1.5px dotted var(--encre-pale);
  transition: transform 0.25s var(--ressort);
}

.repere--oeil {
  color: var(--teinte);
  border: 0;
  background: color-mix(in srgb, var(--papier-clair) 85%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--papier-clair) 60%, transparent),
    0 0 18px 4px color-mix(in srgb, var(--teinte) 35%, transparent);
}

.repere--tampon {
  color: var(--papier-clair);
  border: 0;
  background: var(--teinte);
}

.repere--choisi { transform: scale(1.2); }

.moi {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--encre) 35%, transparent) 30%, transparent 70%);
}
.moi span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--encre);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--encre) 25%, transparent);
}

.leaflet-container { font-family: var(--sans); background: var(--papier); }
.leaflet-control-attribution {
  background: color-mix(in srgb, var(--papier-clair) 80%, transparent) !important;
  font-size: 0.58rem;
}
</style>
