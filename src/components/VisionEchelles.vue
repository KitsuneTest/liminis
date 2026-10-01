<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { construireNiveau, libererNiveau } from '../lib/echelles3d'

const props = defineProps({
  fresque: { type: Object, required: true },
  echelles: { type: Array, required: true },
})

const emit = defineEmits(['niveau'])

const FACTEUR = 7

const conteneur = ref(null)

let renderer = null
let camera = null
let niveaux = []
let observateur = null
let horloge = null

let zoom = 0
let zoomAffiche = 0
let niveauEmis = -1
let rotX = 0
let rotY = 0
let rotAuto = 0

const pointeurs = new Map()
let pincement = null
let glisse = null

const borner = (v, min, max) => Math.min(max, Math.max(min, v))
const lisser = (a, b, x) => {
  const t = borner((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function aller(i) {
  zoom = borner(i, 0, niveaux.length - 1)
}

function ecart() {
  const [a, b] = [...pointeurs.values()]
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function surAppui(e) {
  conteneur.value.setPointerCapture(e.pointerId)
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointeurs.size === 2) {
    pincement = { ecart: ecart(), zoom }
    glisse = null
  } else if (pointeurs.size === 1) {
    glisse = { x: e.clientX, y: e.clientY, rotX, rotY }
  }
}

function surDeplacement(e) {
  if (!pointeurs.has(e.pointerId)) return
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pincement && pointeurs.size >= 2) {
    zoom = borner(pincement.zoom + Math.log2(ecart() / pincement.ecart) * 1.3, 0, niveaux.length - 1)
  } else if (glisse) {
    rotY = glisse.rotY + (e.clientX - glisse.x) * 0.008
    rotX = borner(glisse.rotX + (e.clientY - glisse.y) * 0.006, -0.9, 0.9)
  }
}

function surRelache(e) {
  pointeurs.delete(e.pointerId)
  if (pointeurs.size < 2) pincement = null
  if (pointeurs.size === 1) {
    const [p] = pointeurs.values()
    glisse = { x: p.x, y: p.y, rotX, rotY }
  } else if (pointeurs.size === 0) {
    glisse = null
  }
}

function surMolette(e) {
  e.preventDefault()
  zoom = borner(zoom - e.deltaY * 0.0025, 0, niveaux.length - 1)
}

function rendu() {
  const dt = Math.min(horloge.getDelta(), 0.05)
  zoomAffiche += (zoom - zoomAffiche) * Math.min(1, dt * 9)
  rotAuto += dt * 0.25

  const proche = Math.round(zoomAffiche)
  if (proche !== niveauEmis) {
    niveauEmis = proche
    emit('niveau', proche)
  }

  renderer.clear()
  const dernier = niveaux.length - 1
  niveaux.forEach((n, i) => {
    const t = zoomAffiche - i
    const opacite = (i === 0 ? 1 : lisser(-1, -0.45, t)) * (i === dernier ? 1 : 1 - lisser(0.35, 0.95, t))
    if (opacite < 0.01) return

    n.pivot.scale.setScalar(FACTEUR ** t)
    if (n.contenu.userData.foyer) {
      const k = lisser(0, 0.7, t)
      n.contenu.position.set(-n.contenu.userData.foyer.x * k, -n.contenu.userData.foyer.y * k, 0)
    }
    if (n.type !== 'photo') {
      n.pivot.rotation.set(
        (n.contenu.userData.inclinaison ?? 0) + rotX,
        rotY + (n.contenu.userData.tourne ? rotAuto : Math.sin(rotAuto) * 0.15),
        0
      )
    }
    n.materiaux.forEach((m) => (m.opacity = m.userData.opacite * opacite))

    // Each level gets its own depth buffer, so the deeper one always draws on top.
    renderer.clearDepth()
    renderer.render(n.scene, camera)
  })
}

function redimensionner() {
  const { clientWidth: l, clientHeight: h } = conteneur.value
  if (!l || !h) return
  renderer.setSize(l, h, false)
  camera.aspect = l / h
  camera.updateProjectionMatrix()
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x17142f)
  renderer.autoClear = false
  conteneur.value.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.z = 5.5

  niveaux = props.echelles.map((e) => construireNiveau(e, props.fresque))

  redimensionner()
  observateur = new ResizeObserver(redimensionner)
  observateur.observe(conteneur.value)
  conteneur.value.addEventListener('wheel', surMolette, { passive: false })

  horloge = new THREE.Clock()
  renderer.setAnimationLoop(rendu)
})

onBeforeUnmount(() => {
  renderer.setAnimationLoop(null)
  observateur?.disconnect()
  conteneur.value?.removeEventListener('wheel', surMolette)
  niveaux.forEach(libererNiveau)
  renderer.dispose()
})

defineExpose({ aller })
</script>

<template>
  <div
    ref="conteneur"
    class="vision"
    @pointerdown="surAppui"
    @pointermove="surDeplacement"
    @pointerup="surRelache"
    @pointercancel="surRelache"
  ></div>
</template>

<style scoped>
.vision {
  position: absolute;
  inset: 0;
  touch-action: none;
  cursor: grab;
}
.vision :deep(canvas) { display: block; width: 100%; height: 100%; }
</style>
