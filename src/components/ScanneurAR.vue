<script setup>
// Camera viewfinder: getUserMedia plus a colour-signature check that stands in
// for image tracking until MindAR targets exist (see public/ar/README.md).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  collectes: { type: Array, default: () => [] },
  nbFragments: { type: Number, default: 3 },
  // [hueMin, hueMax] in degrees; wraps when min > max.
  teinteCible: { type: Array, default: () => [0, 360] },
})

const emit = defineEmits(['collecte'])

const video = ref(null)
const etat = ref('attente') // attente | demande | actif | refuse | indisponible | insecure | occupee
const detailErreur = ref('')
const fragmentAnime = ref(null)

const reconnue = ref(false)
const affinite = ref(0)

let flux = null
let canvas = null
let minuteur = null
let bonnesLectures = 0

const ANCRAGES = [
  { x: 27, y: 34 },
  { x: 71, y: 28 },
  { x: 44, y: 66 },
  { x: 78, y: 61 },
  { x: 18, y: 58 },
]

const fragments = computed(() =>
  Array.from({ length: props.nbFragments }, (_, i) => ({
    id: `frag-${i + 1}`,
    ...ANCRAGES[i % ANCRAGES.length],
  })).filter((f) => !props.collectes.includes(f.id))
)

const cameraActive = computed(() => etat.value === 'actif')

const MESSAGES = {
  refuse: {
    titre: 'Caméra refusée',
    texte:
      "L'autorisation a été refusée. Ouvrez les réglages du site (l'icône à gauche de l'adresse) pour réautoriser la caméra, puis rechargez.",
  },
  insecure: {
    titre: 'Connexion non sécurisée',
    texte:
      "Les navigateurs n'ouvrent la caméra qu'en HTTPS. Ouvrez le site via son adresse https:// (ou localhost en développement).",
  },
  indisponible: {
    titre: 'Aucune caméra détectée',
    texte: 'Cet appareil ne propose pas de caméra utilisable par le navigateur.',
  },
  occupee: {
    titre: 'Caméra occupée',
    texte:
      'Une autre application utilise déjà la caméra. Fermez-la (appareil photo, visio…) puis réessayez.',
  },
}
const message = computed(() => MESSAGES[etat.value] ?? null)

function teintePrincipale(data) {
  const bins = new Float32Array(36)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    if (delta < 0.12 || max < 0.15) continue // greys and shadows carry no hue

    let h
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360

    bins[Math.floor(h / 10) % 36] += delta * max
  }

  let pic = -1
  let poids = 0
  let somme = 0
  for (let i = 0; i < 36; i++) {
    somme += bins[i]
    if (bins[i] > poids) {
      poids = bins[i]
      pic = i
    }
  }
  return somme > 0 ? { hue: pic * 10 + 5, force: poids / somme } : null
}

function dansLaCible(hue) {
  const [min, max] = props.teinteCible
  return min <= max ? hue >= min && hue <= max : hue >= min || hue <= max
}

function analyser() {
  const v = video.value
  if (!v || v.readyState < 2 || !v.videoWidth) return

  canvas ??= Object.assign(document.createElement('canvas'), { width: 64, height: 48 })
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  // Centre crop: the mural is what the visitor is aiming at.
  const cote = Math.min(v.videoWidth, v.videoHeight) * 0.8
  ctx.drawImage(
    v,
    (v.videoWidth - cote) / 2,
    (v.videoHeight - cote) / 2,
    cote,
    cote,
    0,
    0,
    64,
    48
  )

  const lecture = teintePrincipale(ctx.getImageData(0, 0, 64, 48).data)
  const ok = lecture !== null && dansLaCible(lecture.hue) && lecture.force > 0.12

  bonnesLectures = ok ? Math.min(bonnesLectures + 1, 4) : Math.max(bonnesLectures - 1, 0)
  affinite.value = bonnesLectures / 4
  if (bonnesLectures >= 3) reconnue.value = true
}

async function demarrerCamera() {
  // Checked before the call: the native error is otherwise unreadable.
  if (!window.isSecureContext) {
    etat.value = 'insecure'
    return
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    etat.value = 'indisponible'
    return
  }

  etat.value = 'demande'
  try {
    flux = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    video.value.srcObject = flux
    // play() can reject if the tab goes to the background.
    await video.value.play().catch(() => {})
    etat.value = 'actif'
    minuteur = setInterval(analyser, 350)
  } catch (err) {
    detailErreur.value = `${err.name} : ${err.message}`
    if (err.name === 'NotAllowedError' || err.name === 'SecurityError') etat.value = 'refuse'
    else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')
      etat.value = 'indisponible'
    else if (err.name === 'NotReadableError' || err.name === 'AbortError') etat.value = 'occupee'
    else etat.value = 'indisponible'
  }
}

function arreterCamera() {
  clearInterval(minuteur)
  minuteur = null
  flux?.getTracks().forEach((t) => t.stop()) // otherwise the LED stays on
  flux = null
  if (video.value) video.value.srcObject = null
  if (etat.value === 'actif') etat.value = 'attente'
  reconnue.value = false
  affinite.value = 0
  bonnesLectures = 0
}

function collecter(fragment) {
  if (!reconnue.value) return
  fragmentAnime.value = fragment.id
  setTimeout(() => {
    emit('collecte', fragment.id)
    fragmentAnime.value = null
  }, 420)
}

// Android refuses to reopen a stream left running in the background.
function surVisibilite() {
  if (document.hidden) arreterCamera()
}

onMounted(() => document.addEventListener('visibilitychange', surVisibilite))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', surVisibilite)
  arreterCamera()
})

defineExpose({ arreterCamera })
</script>

<template>
  <div class="viseur" :class="{ 'viseur--actif': cameraActive }">
    <video ref="video" class="viseur__flux" playsinline muted autoplay :hidden="!cameraActive"></video>

    <div v-if="cameraActive" class="cadre" :class="{ 'cadre--verrouille': reconnue }" aria-hidden="true">
      <i></i><i></i><i></i><i></i>
    </div>

    <button
      v-for="f in fragments"
      v-show="cameraActive && reconnue"
      :key="f.id"
      class="fragment"
      :class="{ 'fragment--pris': fragmentAnime === f.id }"
      :style="{ left: f.x + '%', top: f.y + '%' }"
      type="button"
      aria-label="Fragment à révéler"
      @click="collecter(f)"
    >
      <span class="fragment__lueur"></span>
    </button>

    <div v-if="cameraActive" class="etat" :class="{ 'etat--ok': reconnue }">
      <template v-if="reconnue">
        <span class="etat__point"></span>
        Fresque reconnue — cherchez les éclats
      </template>
      <template v-else>
        <span class="etat__jauge"><i :style="{ width: affinite * 100 + '%' }"></i></span>
        Cadrez la fresque…
      </template>
    </div>

    <div v-if="etat === 'attente'" class="voile pile">
      <span class="voile__icone">◉</span>
      <h3>Ouvrir la caméra</h3>
      <p class="legende">
        Cadrez le mur en entier. Quand la fresque est reconnue, de petits éclats
        se mettent à luire — à vous de les repérer.
      </p>
      <button class="bouton bouton--accent" type="button" @click="demarrerCamera">
        Activer la caméra
      </button>
    </div>

    <div v-else-if="etat === 'demande'" class="voile pile">
      <span class="voile__icone voile__icone--tourne">◌</span>
      <p class="legende">Autorisez l'accès à la caméra…</p>
    </div>

    <div v-else-if="message" class="voile pile">
      <span class="voile__icone">⚠</span>
      <h3>{{ message.titre }}</h3>
      <p class="legende">{{ message.texte }}</p>
      <button class="bouton bouton--secondaire" type="button" @click="demarrerCamera">
        Réessayer
      </button>
      <p v-if="detailErreur" class="detail">{{ detailErreur }}</p>
    </div>

    <div v-if="cameraActive" class="barre">
      <span class="barre__compte">{{ collectes.length }} / {{ nbFragments }}</span>
      <button
        v-if="!reconnue"
        class="bouton bouton--petit bouton--secondaire"
        type="button"
        @click="reconnue = true"
      >
        Je la vois
      </button>
      <button class="bouton bouton--petit bouton--secondaire" type="button" @click="arreterCamera">
        Fermer
      </button>
    </div>
  </div>
</template>

<style scoped>
.viseur {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  max-height: 70svh;
  border: var(--trait);
  border-radius: var(--rayon);
  overflow: hidden;
  background: var(--papier);
  box-shadow: var(--ombre-carte);
}
.viseur--actif { background: #14100c; }

.viseur__flux { width: 100%; height: 100%; object-fit: cover; display: block; }

.cadre { position: absolute; inset: 16px; pointer-events: none; }
.cadre i {
  position: absolute;
  width: 26px;
  height: 26px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 3px;
  transition: border-color 0.5s var(--doux), width 0.5s var(--doux), height 0.5s var(--doux);
}
.cadre i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.cadre i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.cadre i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.cadre i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.cadre--verrouille i { border-color: rgba(255, 255, 255, 0.95); width: 34px; height: 34px; }

/* Deliberately faint: the visitor has to find these. */
.fragment {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.fragment__lueur {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.12) 65%, transparent 72%);
  animation: souffle 4.2s ease-in-out infinite;
}
.fragment:nth-of-type(2) .fragment__lueur { animation-delay: -1.6s; }
.fragment:nth-of-type(3) .fragment__lueur { animation-delay: -3.1s; }

@keyframes souffle {
  0%, 100% { opacity: 0.18; transform: scale(0.85); }
  50%      { opacity: 0.62; transform: scale(1.15); }
}

.fragment--pris { animation: attrape 0.42s ease-in forwards; }
@keyframes attrape {
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  35%  { transform: translate(-50%, -50%) scale(2.1); opacity: 1; }
  100% { transform: translate(-50%, 150%) scale(0.2); opacity: 0; }
}

.etat {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.45rem;
  max-width: calc(100% - 24px);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(20, 16, 12, 0.55);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
.etat--ok { background: rgba(44, 122, 82, 0.72); }

.etat__point {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  animation: souffle 2s ease-in-out infinite;
}

.etat__jauge {
  width: 26px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}
.etat__jauge i {
  display: block;
  height: 100%;
  background: #fff;
  transition: width 0.35s var(--doux);
}

.voile {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  background: var(--papier-clair);
}
.voile__icone { font-size: 2.2rem; color: var(--kraft-fonce); line-height: 1; }
.voile__icone--tourne { animation: tourne 1.1s linear infinite; }
@keyframes tourne { to { transform: rotate(360deg); } }

.detail {
  font-size: 0.7rem;
  color: var(--encre-pale);
  font-family: ui-monospace, Consolas, monospace;
  word-break: break-word;
}

.barre {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.45rem 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(253, 248, 236, 0.93);
  border: 1px solid var(--ligne-forte);
  box-shadow: var(--ombre-2);
}
.barre__compte { font-size: 0.8rem; font-weight: 700; }
</style>
