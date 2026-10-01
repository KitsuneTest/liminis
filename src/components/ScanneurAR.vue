<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { preparerCible } from '../lib/cibleAR'
import { animerFragment, creerFragment, libererObjet } from '../lib/fragment3d'

const props = defineProps({
  fresque: { type: Object, required: true },
  collectes: { type: Array, default: () => [] },
})

const emit = defineEmits(['collecte'])

const scene = ref(null)
const etat = ref('preparation') // preparation | demande | actif | refuse | indisponible | insecure | occupee | cible
const detailErreur = ref('')
const avancement = ref(0)
const reconnue = ref(false)

let promesseCible = null
let cible = null
let THREE = null
let ar = null
let horloge = null
let rayon = null
let tentative = 0
const fragments = new Map()


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
  cible: {
    titre: 'Reconnaissance indisponible',
    texte:
      "L'image de référence de la fresque n'a pas pu être préparée. Rechargez la page avec une connexion, puis réessayez.",
  },
}
const message = computed(() => MESSAGES[etat.value] ?? null)

function preparer() {
  promesseCible ??= preparerCible(props.fresque, (p) => (avancement.value = Math.round(p))).catch(
    (err) => {
      promesseCible = null
      throw err
    }
  )
  return promesseCible
}

function erreurCamera(err) {
  detailErreur.value = `${err.name} : ${err.message}`
  if (err.name === 'NotAllowedError' || err.name === 'SecurityError') etat.value = 'refuse'
  else if (err.name === 'NotReadableError' || err.name === 'AbortError') etat.value = 'occupee'
  else etat.value = 'indisponible'
}

function poserFragments(ancre) {
  const teinte = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${props.fresque.couleur}`)
    .trim()
  props.fresque.ancrages.slice(0, props.fresque.nbFragments).forEach(({ u, v }, i) => {
    const id = `frag-${i + 1}`
    if (props.collectes.includes(id)) return
    const fragment = creerFragment(teinte, i * 1.7)
    fragment.position.set(u - 0.5, (0.5 - v) * cible.ratio, 0)
    fragment.userData.id = id
    fragment.userData.taille = 0.022
    fragment.scale.setScalar(0.022)
    ancre.group.add(fragment)
    fragments.set(id, fragment)
  })
}

function rendu() {
  const dt = horloge.getDelta()
  const temps = horloge.elapsedTime
  for (const [id, fragment] of fragments) {
    if (!animerFragment(fragment, temps, dt)) continue
    fragment.removeFromParent()
    libererObjet(fragment)
    fragments.delete(id)
    emit('collecte', id)
  }
  ar.renderer.render(ar.scene, ar.camera)
}

function toucher(e) {
  if (!ar || !reconnue.value) return
  const cadre = ar.renderer.domElement.getBoundingClientRect()
  const ndc = new THREE.Vector2(
    ((e.clientX - cadre.left) / cadre.width) * 2 - 1,
    -((e.clientY - cadre.top) / cadre.height) * 2 + 1
  )
  rayon.setFromCamera(ndc, ar.camera)
  const zones = [...fragments.values()]
    .filter((f) => f.userData.collecte === null)
    .map((f) => f.userData.zone)
  const [touche] = rayon.intersectObjects(zones, false)
  if (touche) touche.object.parent.userData.collecte = horloge.elapsedTime
}

async function demarrerCamera() {
  if (!window.isSecureContext) {
    etat.value = 'insecure'
    return
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    etat.value = 'indisponible'
    return
  }

  const n = ++tentative
  etat.value = 'preparation'
  try {
    cible = await preparer()
  } catch (err) {
    detailErreur.value = String(err?.message ?? err)
    etat.value = 'cible'
    return
  }

  if (n !== tentative) return

  // MindAR swallows getUserMedia errors, so the permission is checked here first.
  etat.value = 'demande'
  try {
    const flux = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
    flux.getTracks().forEach((t) => t.stop())
  } catch (err) {
    erreurCamera(err)
    return
  }
  if (n !== tentative) return

  let instance = null
  try {
    const [{ MindARThree }, three] = await Promise.all([
      import('mind-ar/dist/mindar-image-three.prod.js'),
      import('three'),
    ])
    THREE = three
    instance = new MindARThree({
      container: scene.value,
      imageTargetSrc: cible.url,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      filterMinCF: 0.0001,
      filterBeta: 0.001,
    })
    instance.scene.add(new THREE.HemisphereLight(0xfbf0de, 0x2c2660, 1.8))
    const soleil = new THREE.DirectionalLight(0xffffff, 1.2)
    soleil.position.set(0.5, 1, 2)
    instance.scene.add(soleil)

    const ancre = instance.addAnchor(0)
    ancre.onTargetFound = () => (reconnue.value = true)
    ancre.onTargetLost = () => (reconnue.value = false)
    poserFragments(ancre)

    await instance.start()
    if (n !== tentative) {
      fermer(instance)
      return
    }
    ar = instance
    horloge = new THREE.Clock()
    rayon = new THREE.Raycaster()
    ar.renderer.setAnimationLoop(rendu)
    etat.value = 'actif'
  } catch (err) {
    if (instance) fermer(instance)
    detailErreur.value = String(err?.message ?? err)
    nettoyer()
    etat.value = 'indisponible'
  }
}

function fermer(instance) {
  instance.renderer.setAnimationLoop(null)
  try {
    instance.stop()
  } catch {}
  instance.renderer.dispose()
}

function nettoyer() {
  tentative++
  if (ar) fermer(ar)
  ar = null
  fragments.forEach(libererObjet)
  fragments.clear()
  scene.value?.replaceChildren()
  reconnue.value = false
}

// Android refuses to reopen a stream left running in the background.
function surVisibilite() {
  if (document.hidden) nettoyer()
  else if (!message.value) demarrerCamera()
}

onMounted(() => {
  document.addEventListener('visibilitychange', surVisibilite)
  demarrerCamera()
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', surVisibilite)
  nettoyer()
  if (cible?.url.startsWith('blob:')) URL.revokeObjectURL(cible.url)
})

</script>

<template>
  <div class="viseur">
    <div ref="scene" class="viseur__scene" @pointerdown="toucher"></div>

    <div v-if="etat === 'preparation' || etat === 'demande'" class="voile">
      <span class="voile__icone voile__icone--tourne">◌</span>
      <span v-if="etat === 'preparation'" class="jauge"><i :style="{ width: avancement + '%' }"></i></span>
    </div>

    <div v-else-if="message" class="voile voile--erreur">
      <h3>{{ message.titre }}</h3>
      <p class="legende">{{ message.texte }}</p>
      <button class="bouton bouton--secondaire" type="button" @click="demarrerCamera">
        Réessayer
      </button>
      <p v-if="detailErreur" class="detail">{{ detailErreur }}</p>
    </div>
  </div>
</template>

<style scoped>
.viseur {
  position: relative;
  overflow: hidden;
  background: #17142f;
}

.viseur__scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: manipulation;
}

.voile {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 1.5rem;
  color: var(--papier);
}
.voile--erreur { background: var(--papier-clair); color: var(--encre); }

.voile__icone { font-size: 2.2rem; line-height: 1; }
.voile__icone--tourne { animation: tourne 1.1s linear infinite; }
@keyframes tourne { to { transform: rotate(360deg); } }

.jauge {
  width: min(50%, 160px);
  height: 3px;
  border-radius: 999px;
  background: rgba(251, 240, 222, 0.25);
  overflow: hidden;
}
.jauge i {
  display: block;
  height: 100%;
  background: var(--papier);
  transition: width 0.3s var(--doux);
}

.detail {
  font-size: 0.7rem;
  color: var(--encre-pale);
  font-family: var(--mono);
  word-break: break-word;
}
</style>
