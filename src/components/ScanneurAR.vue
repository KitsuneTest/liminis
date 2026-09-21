<script setup>
// Camera viewfinder: getUserMedia stream plus tappable fragments.
// MindAR image tracking will plug in here (see public/ar/README.md).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  // Ids of fragments already collected, so they are not shown again.
  collectes: { type: Array, default: () => [] },
  nbFragments: { type: Number, default: 4 },
})

const emit = defineEmits(['collecte'])

const video = ref(null)
const etat = ref('attente') // attente | demande | actif | refuse | indisponible | insecure | occupee
const detailErreur = ref('')
const fragmentAnime = ref(null)
let flux = null

// Fixed positions: randomising at render time would make them jump on every update.
const ANCRAGES = [
  { x: 24, y: 30, teinte: 'var(--mousse)', forme: '✦' },
  { x: 73, y: 24, teinte: 'var(--lagon)', forme: '❋' },
  { x: 32, y: 68, teinte: 'var(--or)', forme: '✺' },
  { x: 76, y: 62, teinte: 'var(--prune)', forme: '❖' },
  { x: 50, y: 45, teinte: 'var(--terre)', forme: '✷' },
  { x: 15, y: 50, teinte: 'var(--mousse)', forme: '✧' },
]

const fragments = computed(() =>
  Array.from({ length: props.nbFragments }, (_, i) => ({
    id: `frag-${i + 1}`,
    ...ANCRAGES[i % ANCRAGES.length],
  })).filter((f) => !props.collectes.includes(f.id))
)

const cameraActive = computed(() => etat.value === 'actif')

// --- Error messages ---------------------------------------------------------
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
    texte: "Cet appareil ne propose pas de caméra utilisable par le navigateur.",
  },
  occupee: {
    titre: 'Caméra occupée',
    texte:
      'Une autre application utilise déjà la caméra. Fermez-la (appareil photo, visio…) puis réessayez.',
  },
}
const message = computed(() => MESSAGES[etat.value] ?? null)

// --- Opening the stream -----------------------------------------------------
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
        facingMode: { ideal: 'environment' }, // rear camera where there is one
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    video.value.srcObject = flux
    // play() can reject if the tab goes to the background.
    await video.value.play().catch(() => {})
    etat.value = 'actif'
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
  flux?.getTracks().forEach((t) => t.stop()) // otherwise the LED stays on
  flux = null
  if (video.value) video.value.srcObject = null
  if (etat.value === 'actif') etat.value = 'attente'
}

// --- Collecting ------------------------------------------------------------
function collecter(fragment) {
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
    <video
      ref="video"
      class="viseur__flux"
      playsinline
      muted
      autoplay
      :hidden="!cameraActive"
    ></video>

    <!-- Viewfinder corners, scan-frame style -->
    <div v-if="cameraActive" class="coins" aria-hidden="true">
      <i></i><i></i><i></i><i></i>
    </div>

    <!-- The fragments to catch -->
    <button
      v-for="f in fragments"
      v-show="cameraActive"
      :key="f.id"
      class="fragment"
      :class="{ 'fragment--pris': fragmentAnime === f.id }"
      :style="{ left: f.x + '%', top: f.y + '%', '--teinte': f.teinte }"
      type="button"
      @click="collecter(f)"
    >
      <span class="fragment__glyphe">{{ f.forme }}</span>
      <span class="fragment__halo"></span>
    </button>

    <!-- State: before opening -->
    <div v-if="etat === 'attente'" class="voile pile">
      <span class="voile__icone">◉</span>
      <h3>Ouvrir la caméra</h3>
      <p class="legende">
        Visez la fresque. Les fragments apparaissent dans le viseur — touchez-les
        pour les ajouter à votre carnet.
      </p>
      <button class="bouton bouton--accent" type="button" @click="demarrerCamera">
        Activer la caméra
      </button>
    </div>

    <div v-else-if="etat === 'demande'" class="voile pile">
      <span class="voile__icone voile__icone--tourne">◌</span>
      <p class="legende">Autorisez l'accès à la caméra…</p>
    </div>

    <!-- State: failed, with what to do about it -->
    <div v-else-if="message" class="voile pile">
      <span class="voile__icone">⚠</span>
      <h3>{{ message.titre }}</h3>
      <p class="legende">{{ message.texte }}</p>
      <button class="bouton bouton--secondaire" type="button" @click="demarrerCamera">
        Réessayer
      </button>
      <p v-if="detailErreur" class="detail">{{ detailErreur }}</p>
    </div>

    <!-- Bottom bar while the camera is running -->
    <div v-if="cameraActive" class="barre">
      <span class="barre__compte">
        {{ collectes.length }} / {{ nbFragments }} fragments
      </span>
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

.viseur__flux {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* --- Scan frame ------------------------------------------------------------ */
.coins { position: absolute; inset: 14px; pointer-events: none; }
.coins i {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(253, 248, 236, 0.9);
  border-radius: 4px;
}
.coins i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.coins i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.coins i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.coins i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }

/* --- Fragments ------------------------------------------------------------- */
.fragment {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  animation: flotte 3.4s ease-in-out infinite;
}
.fragment:nth-child(odd) { animation-delay: -1.2s; }

.fragment__glyphe {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  font-size: 1.4rem;
  color: var(--papier-clair);
  background: var(--teinte);
  border: 2.5px solid var(--papier-clair);
  border-radius: 50%;
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.7);
}

.fragment__halo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--teinte);
  opacity: 0.55;
  animation: respire 2.2s ease-out infinite;
}

.fragment--pris { animation: attrape 0.42s ease-in forwards; }

@keyframes flotte {
  0%, 100% { margin-top: 0; }
  50%      { margin-top: -10px; }
}
@keyframes respire {
  0%   { transform: scale(0.85); opacity: 0.6; }
  100% { transform: scale(1.5);  opacity: 0; }
}
@keyframes attrape {
  0%   { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
  40%  { transform: translate(-50%, -50%) scale(1.35) rotate(12deg); opacity: 1; }
  100% { transform: translate(-50%, 140%) scale(0.2) rotate(-25deg); opacity: 0; }
}

/* --- Overlays (non-camera states) ------------------------------------------ */
.voile {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  background: var(--papier-clair);
}
.voile__icone {
  font-size: 2.2rem;
  color: var(--kraft-fonce);
  line-height: 1;
}
.voile__icone--tourne { animation: tourne 1.1s linear infinite; }
@keyframes tourne { to { transform: rotate(360deg); } }

.detail {
  font-size: 0.7rem;
  color: var(--encre-pale);
  font-family: ui-monospace, Consolas, monospace;
  word-break: break-word;
}

/* --- Bottom bar ------------------------------------------------------------ */
.barre {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.45rem 0.45rem 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(253, 248, 236, 0.93);
  border: 1px solid var(--ligne-forte);
  box-shadow: var(--ombre-2);
}
.barre__compte { font-size: 0.8rem; font-weight: 700; }
</style>
