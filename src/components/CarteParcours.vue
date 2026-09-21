<script setup>
// Trail map: CSS-drawn markers, still readable when tiles fail to load.
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CENTRE_PARCOURS } from '../data/fresques'

const props = defineProps({
  fresques: { type: Array, required: true },
  // { 'fresque-1': { tampon: true, ... }, … }
  etats: { type: Object, required: true },
  // User position: { lat, lng, accuracy } or null
  position: { type: Object, default: null },
  plein: { type: Boolean, default: false },
})

const emit = defineEmits(['choisir'])

const conteneur = ref(null)
const carte = shallowRef(null)
const tuilesOk = ref(true)
// Off by default: the map holds the campus framing until "Moi" is tapped.
const suitUtilisateur = ref(false)

let coucheMarqueurs = null
let marqueurUtilisateur = null
let cercleErreur = null
const marqueursParId = new Map()

// --- Icons: an HTML/CSS stamp, nothing to precache for offline use --------
function iconeFresque(fresque, index, visitee) {
  const teintes = ['var(--mousse)', 'var(--lagon)', 'var(--prune)']
  const teinte = teintes[index % teintes.length]
  return L.divIcon({
    className: 'marqueur-liminis',
    html: `
      <div class="marqueur ${visitee ? 'marqueur--visitee' : ''}" style="--teinte:${teinte}">
        <span class="marqueur__num">${visitee ? '✓' : index + 1}</span>
        <span class="marqueur__pointe"></span>
      </div>`,
    iconSize: [46, 58],
    iconAnchor: [23, 56],
    popupAnchor: [0, -52],
  })
}

const iconeUtilisateur = () =>
  L.divIcon({
    className: 'marqueur-liminis',
    html: '<div class="marqueur-moi"><span></span></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

// --- Building ---------------------------------------------------------------
function dessinerFresques() {
  if (!carte.value) return
  coucheMarqueurs.clearLayers()
  marqueursParId.clear()

  props.fresques.forEach((f, i) => {
    const visitee = props.etats[f.id]?.tampon === true

    // The validation zone to reach.
    L.circle([f.lat, f.lng], {
      radius: f.rayon,
      color: visitee ? '#2f7d4f' : '#b9986a',
      weight: 2,
      dashArray: visitee ? null : '6 6',
      fillColor: visitee ? '#5b8c5a' : '#d8c09a',
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(coucheMarqueurs)

    const m = L.marker([f.lat, f.lng], {
      icon: iconeFresque(f, i, visitee),
      keyboard: true,
      alt: f.nom,
    })
      .addTo(coucheMarqueurs)
      .bindPopup(
        `<img class="popup-photo" src="${f.photo}" alt="">` +
          `<strong>${f.nom}</strong><br>` +
          (visitee ? 'Tampon obtenu ✓' : `Approchez-vous à moins de ${f.rayon} m`)
      )

    m.on('click', () => emit('choisir', f.id))
    marqueursParId.set(f.id, m)
  })
}

function centrerSurMoi() {
  if (!carte.value || !props.position) return
  suitUtilisateur.value = true
  carte.value.flyTo([props.position.lat, props.position.lng], 17, { duration: 0.8 })
}

function centrerSur(id) {
  const m = marqueursParId.get(id)
  if (!m || !carte.value) return
  suitUtilisateur.value = false
  carte.value.flyTo(m.getLatLng(), 18, { duration: 0.8 })
  m.openPopup()
}

function centrerSurCampus() {
  if (!carte.value) return
  suitUtilisateur.value = false
  carte.value.flyTo([CENTRE_PARCOURS.lat, CENTRE_PARCOURS.lng], CENTRE_PARCOURS.zoom, {
    duration: 0.8,
  })
}

defineExpose({ centrerSur, centrerSurMoi, centrerSurCampus })

// --- Lifecycle --------------------------------------------------------------
onMounted(() => {
  const map = L.map(conteneur.value, {
    center: [CENTRE_PARCOURS.lat, CENTRE_PARCOURS.lng],
    zoom: CENTRE_PARCOURS.zoom,
    zoomControl: false,
    attributionControl: true,
  })
  carte.value = map

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const tuiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '© OpenStreetMap',
    crossOrigin: true,
  }).addTo(map)

  // Offline: say so rather than showing a grey square.
  tuiles.on('tileerror', () => { tuilesOk.value = false })
  tuiles.on('tileload', () => { tuilesOk.value = true })

  coucheMarqueurs = L.layerGroup().addTo(map)
  dessinerFresques()

  // Panning by hand turns off auto-recentering.
  map.on('dragstart', () => { suitUtilisateur.value = false })

  // In a flex layout the container is still 0 px on mount: remeasure once painted.
  // No fitBounds here, so the campus framing survives.
  requestAnimationFrame(() => map.invalidateSize())
})

onBeforeUnmount(() => {
  carte.value?.remove()
  carte.value = null
})

// --- Reactions --------------------------------------------------------------
watch(() => props.etats, dessinerFresques, { deep: true })
watch(() => props.fresques, dessinerFresques, { deep: true })

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
      cercleErreur = L.circle(latlng, {
        radius: pos.accuracy || 0,
        color: '#3e8d9c',
        weight: 1,
        fillColor: '#3e8d9c',
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(carte.value)
    } else {
      marqueurUtilisateur.setLatLng(latlng)
      cercleErreur.setLatLng(latlng).setRadius(pos.accuracy || 0)
    }

    if (suitUtilisateur.value) carte.value.panTo(latlng, { animate: true })
  },
  { deep: true }
)
</script>

<template>
  <div class="carte-bloc" :class="{ 'carte-bloc--plein': plein }">
    <div ref="conteneur" class="carte" role="application" aria-label="Carte du parcours"></div>

    <p v-if="!tuilesOk" class="carte-hors-ligne">
      Fond de carte indisponible (hors-ligne) — les repères restent utilisables.
    </p>

    <div class="carte-outils">
      <button class="outil" type="button" title="Revenir sur le campus" @click="centrerSurCampus">
        ⌂<span class="outil__txt">UNC</span>
      </button>
      <button
        class="outil"
        type="button"
        :disabled="!position"
        :title="position ? 'Me localiser' : 'Position inconnue'"
        @click="centrerSurMoi"
      >
        ◎<span class="outil__txt">Moi</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.carte-bloc {
  position: relative;
  border: var(--trait);
  border-radius: var(--rayon);
  overflow: hidden;
  box-shadow: var(--ombre-2);
  background: var(--papier-ombre);
}

.carte {
  height: clamp(300px, 46svh, 460px);
  width: 100%;
  /* Paper background stays visible until the tiles arrive */
  background: var(--papier);
}

.carte-hors-ligne {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 500;
  font-size: 0.78rem;
  text-align: center;
  padding: 0.45rem 0.6rem;
  border-radius: 999px;
  background: rgba(253, 248, 236, 0.94);
  border: 1px solid var(--ligne-forte);
  color: var(--encre-douce);
  box-shadow: var(--ombre-1);
}

.carte-bloc--plein {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  min-height: 0;
}
.carte-bloc--plein .carte { height: auto; flex: 1; min-height: 0; }
.carte-bloc--plein .carte-outils { top: calc(10px + env(safe-area-inset-top, 0px)); }

.carte-outils {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.outil {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.95rem;
  line-height: 1;
  padding: 0.5rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--ligne-forte);
  background: color-mix(in srgb, var(--papier-clair) 88%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: var(--encre);
  cursor: pointer;
  box-shadow: var(--ombre-2);
}
.outil[disabled] { opacity: 0.45; }
.outil__txt { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; }
</style>

<!-- Leaflet injects its icons outside Vue's scope: these styles must be global. -->
<style>
.marqueur-liminis { background: none; border: none; }

.marqueur {
  position: relative;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--papier-clair);
  border: 3px solid var(--teinte);
  box-shadow: 0 4px 10px -3px rgba(59, 47, 36, 0.6);
  font-family: var(--serif);
  color: var(--teinte);
}
.marqueur__num { font-size: 1.25rem; font-weight: 700; }

/* The tip that pins the marker to the ground */
.marqueur__pointe {
  position: absolute;
  bottom: -9px;
  left: 50%;
  width: 12px;
  height: 12px;
  background: var(--papier-clair);
  border-right: 3px solid var(--teinte);
  border-bottom: 3px solid var(--teinte);
  transform: translateX(-50%) rotate(45deg);
}

.marqueur--visitee {
  background: var(--teinte);
  color: var(--papier-clair);
}
.marqueur--visitee .marqueur__pointe { background: var(--teinte); }

/* User position: a breathing dot */
.marqueur-moi {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}
.marqueur-moi span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--lagon);
  border: 3px solid var(--papier-clair);
  box-shadow: 0 0 0 0 rgba(62, 141, 156, 0.55);
  animation: pulsation 2s infinite;
}
@keyframes pulsation {
  70%  { box-shadow: 0 0 0 14px rgba(62, 141, 156, 0); }
  100% { box-shadow: 0 0 0 0 rgba(62, 141, 156, 0); }
}

/* Paper styling for Leaflet's popups and controls */
.leaflet-popup-content-wrapper {
  background: var(--papier-clair);
  border: 1px solid var(--ligne);
  border-radius: var(--rayon-s);
  color: var(--encre);
  box-shadow: var(--ombre-3);
}
.leaflet-popup-content { margin: 0.7rem 0.9rem; font-family: var(--sans); font-size: 0.88rem; }
.leaflet-popup-content .popup-photo {
  display: block;
  width: 168px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--rayon-xs);
  margin-bottom: 0.5rem;
}
.leaflet-popup-tip { background: var(--papier-clair); border: 1px solid var(--ligne); }
.leaflet-container { font-family: var(--sans); background: var(--papier); }
.leaflet-control-attribution {
  background: rgba(253, 248, 236, 0.85) !important;
  font-size: 0.62rem;
}
.leaflet-bar a {
  background: var(--papier-clair);
  color: var(--encre);
  border-bottom-color: var(--kraft);
}
.leaflet-bar a:hover { background: var(--papier); }
</style>
