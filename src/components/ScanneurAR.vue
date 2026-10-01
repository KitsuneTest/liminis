<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { preparerCible } from '../lib/cibleAR'
import { animerFragment, creerFragment, libererObjet } from '../lib/fragment3d'
import { PALETTE } from '../lib/palette'

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
const consigne = ref(null)

let promesseCible = null
let cible = null
let THREE = null
let ar = null
let horloge = null
let rayon = null
let tentative = 0
let ancre = null
let matriceInverse = null
let pointCamera = null
const fragments = new Map()

// Yaw, in degrees, beyond which the visitor counts as standing to one side of the mural.
const ANGLE_FACE = 12
const ANGLE_COTE = 15

const CONSIGNES = {
  viser: { texte: 'Visez la fresque en entier' },
  face: { texte: 'Placez-vous bien en face de la fresque', fleche: '↑' },
  gauche: { texte: 'Décalez-vous sur la gauche de la fresque', fleche: '←' },
  droite: { texte: 'Décalez-vous sur la droite de la fresque', fleche: '→' },
  toucher: { texte: 'Un fragment est apparu : touchez-le' },
}


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

function poserFragments() {
  const teinte = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${props.fresque.couleur}`)
    .trim()
  props.fresque.ancrages.slice(0, props.fresque.nbFragments).forEach(({ u, v, vue }, i) => {
    const id = `frag-${i + 1}`
    if (props.collectes.includes(id)) return
    const fragment = creerFragment(teinte, i * 1.7)
    fragment.position.set(u - 0.5, (0.5 - v) * cible.ratio, 0)
    Object.assign(fragment.userData, { id, vue: vue ?? 'face', taille: 0.022, revele: false, apparition: 0 })
    fragment.scale.setScalar(1e-4)
    ancre.group.add(fragment)
    fragments.set(id, fragment)
  })
}

// Fragments are revealed one at a time, in order, each from its own vantage point.
function prochainFragment() {
  for (const fragment of fragments.values()) {
    if (fragment.userData.collecte === null) return fragment
  }
  return null
}

function vueCourante() {
  matriceInverse.copy(ancre.group.matrix).invert()
  const camera = pointCamera.set(0, 0, 0).applyMatrix4(matriceInverse)
  const lacet = THREE.MathUtils.radToDeg(Math.atan2(camera.x, camera.z))
  if (Math.abs(lacet) < ANGLE_FACE) return 'face'
  if (lacet <= -ANGLE_COTE) return 'gauche'
  if (lacet >= ANGLE_COTE) return 'droite'
  return null
}

function majConsigne() {
  const prochain = prochainFragment()
  let cle = null
  if (prochain && !reconnue.value) cle = 'viser'
  else if (prochain) {
    if (!prochain.userData.revele && vueCourante() === prochain.userData.vue)
      prochain.userData.revele = true
    cle = prochain.userData.revele ? 'toucher' : prochain.userData.vue
  }
  if (consigne.value?.cle !== cle) consigne.value = cle ? { cle, ...CONSIGNES[cle] } : null
}

function rendu() {
  const dt = horloge.getDelta()
  const temps = horloge.elapsedTime
  majConsigne()
  for (const [id, fragment] of fragments) {
    const donnees = fragment.userData
    if (donnees.collecte === null) {
      donnees.apparition = Math.min(1, donnees.apparition + (donnees.revele ? dt * 2.5 : 0))
      const a = donnees.apparition
      // Slight overshoot so the crystal pops out of the wall.
      fragment.scale.setScalar(donnees.taille * Math.max(1e-4, a * (1 + 0.35 * Math.sin(a * Math.PI))))
    }
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
    .filter((f) => f.userData.collecte === null && f.userData.revele)
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
    instance.scene.add(new THREE.HemisphereLight(PALETTE.papier, PALETTE.encre, 1.8))
    const soleil = new THREE.DirectionalLight(0xffffff, 1.2)
    soleil.position.set(0.5, 1, 2)
    instance.scene.add(soleil)

    ancre = instance.addAnchor(0)
    ancre.onTargetFound = () => (reconnue.value = true)
    ancre.onTargetLost = () => (reconnue.value = false)
    poserFragments()

    await instance.start()
    if (n !== tentative) {
      fermer(instance)
      return
    }
    ar = instance
    horloge = new THREE.Clock()
    rayon = new THREE.Raycaster()
    matriceInverse = new THREE.Matrix4()
    pointCamera = new THREE.Vector3()
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
  ancre = null
  consigne.value = null
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

    <Transition name="consigne">
      <p v-if="etat === 'actif' && consigne" :key="consigne.cle" class="consigne">
        <span v-if="consigne.fleche" class="consigne__fleche">{{ consigne.fleche }}</span>
        {{ consigne.texte }}
      </p>
    </Transition>

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
  background: var(--nuit);
}

.viseur__scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: manipulation;
  /* MindAR puts its video at z-index -2: without this stacking context it falls behind .viseur's background. */
  isolation: isolate;
}

.consigne {
  position: absolute;
  left: 50%;
  bottom: calc(1.4rem + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 2rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--nuit) 72%, transparent);
  color: var(--papier);
  font-size: 0.82rem;
  pointer-events: none;
}
.consigne__fleche { font-size: 1.2rem; line-height: 1; animation: pousse 1.2s ease-in-out infinite; }
@keyframes pousse { 50% { transform: scale(1.25); } }

.consigne-enter-active,
.consigne-leave-active { transition: opacity 0.25s ease; }
.consigne-enter-from,
.consigne-leave-to { opacity: 0; }

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
  background: color-mix(in srgb, var(--papier) 25%, transparent);
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
