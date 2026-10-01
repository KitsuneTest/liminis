import * as THREE from 'three'
import { molecule } from './molecules'

const COULEURS_ATOMES = { C: '#6A4AA8', O: '#C74F20', N: '#3DBDB5', H: '#FBF0DE', R: '#F5CF45' }
const RAYONS_ATOMES = { C: 0.28, O: 0.3, N: 0.29, H: 0.17, R: 0.32 }

function aleatoire(graine) {
  let s = graine
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function materiau(couleur, options = {}) {
  return new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.5, transparent: true, ...options })
}

function grilleHexagonale(pas, rayon) {
  const points = []
  const lignes = Math.ceil(rayon / (pas * 0.866))
  for (let r = -lignes; r <= lignes; r++) {
    for (let q = -lignes; q <= lignes; q++) {
      const x = (q + (r % 2 ? 0.5 : 0)) * pas
      const y = r * pas * 0.866
      if (Math.hypot(x, y) <= rayon) points.push({ x, y })
    }
  }
  return points
}

function photo(niveau, fresque) {
  const groupe = new THREE.Group()
  const { x, y, w, h } = fresque.cible
  const largeur = 2.9
  const plan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true }))
  const placer = (ratio) => {
    plan.scale.set(largeur, largeur * ratio, 1)
    groupe.userData.foyer = new THREE.Vector2(
      (fresque.foyer.u - 0.5) * largeur,
      (0.5 - fresque.foyer.v) * largeur * ratio
    )
  }
  placer((h * 0.75) / w)

  new THREE.TextureLoader().load(fresque.photo, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.repeat.set(w, h)
    texture.offset.set(x, 1 - y - h)
    plan.material.map = texture
    plan.material.needsUpdate = true
    placer((texture.image.height * h) / (texture.image.width * w))
  })

  groupe.add(plan)
  return groupe
}

function domes(niveau) {
  const groupe = new THREE.Group()
  const hasard = aleatoire(7)
  const points = grilleHexagonale(0.36, 1.7)

  const geometrie = new THREE.SphereGeometry(0.17, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)
  geometrie.rotateX(Math.PI / 2)
  const instances = new THREE.InstancedMesh(geometrie, materiau('#ffffff', { roughness: 0.35 }), points.length)
  const m = new THREE.Matrix4()
  const teinte = new THREE.Color()
  points.forEach((p, i) => {
    const s = 0.85 + hasard() * 0.3
    m.compose(
      new THREE.Vector3(p.x, p.y, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(s, s, 0.8 + hasard() * 0.7)
    )
    instances.setMatrixAt(i, m)
    instances.setColorAt(i, teinte.set(niveau.couleur).offsetHSL(0, 0, (hasard() - 0.5) * 0.12))
  })

  const fond = new THREE.Mesh(new THREE.CircleGeometry(1.85, 48), materiau(niveau.fond))
  fond.position.z = -0.01
  groupe.add(fond, instances)
  groupe.userData.inclinaison = -0.6
  return groupe
}

function cellules(niveau) {
  const groupe = new THREE.Group()
  const hasard = aleatoire(11)
  const aplati = niveau.aplati ?? 1
  const centres = [{ x: 0, y: 0 }, ...Array.from({ length: 6 }, (_, k) => ({
    x: Math.cos((k * Math.PI) / 3) * 1.02,
    y: Math.sin((k * Math.PI) / 3) * 1.02 * aplati,
  }))]

  const membrane = materiau(niveau.membrane, { opacity: 0.28, depthWrite: false, roughness: 0.2 })
  const interieur = materiau(niveau.interieur, { opacity: 0.8 })
  const noyau = materiau(niveau.noyau, { roughness: 0.3 })
  const sphere = new THREE.SphereGeometry(1, 32, 20)

  centres.forEach((c) => {
    const cellule = new THREE.Group()
    const enveloppe = new THREE.Mesh(sphere, membrane)
    enveloppe.scale.set(0.52, 0.52 * aplati, 0.52)
    const vacuole = new THREE.Mesh(sphere, interieur)
    vacuole.scale.set(0.4, 0.4 * aplati, 0.38)
    vacuole.position.x = 0.05
    const coeur = new THREE.Mesh(sphere, noyau)
    coeur.scale.setScalar(0.11)
    coeur.position.set(-0.28, 0.12 * aplati, 0.18)
    cellule.add(vacuole, coeur, enveloppe)
    cellule.position.set(c.x, c.y, (hasard() - 0.5) * 0.3)
    cellule.rotation.z = hasard() * Math.PI
    groupe.add(cellule)
  })
  groupe.userData.inclinaison = -0.35
  return groupe
}

function plume(niveau) {
  const groupe = new THREE.Group()
  const rachis = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 3.4, 12), materiau('#FBF0DE'))
  groupe.add(rachis)

  const nombre = 34
  const barbe = new THREE.CylinderGeometry(0.012, 0.02, 1.4, 6)
  barbe.translate(0, 0.7, 0)
  const instances = new THREE.InstancedMesh(barbe, materiau('#ffffff', { roughness: 0.4 }), nombre * 2)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const teinte = new THREE.Color()
  const palette = niveau.couleurs.map((c) => new THREE.Color(c))

  for (let i = 0; i < nombre; i++) {
    const t = i / (nombre - 1)
    const y = -1.6 + t * 3.2
    const longueur = Math.sin(Math.PI * (0.15 + t * 0.8)) * 1.1 + 0.2
    const position = t * (palette.length - 1)
    const k = Math.min(palette.length - 2, Math.floor(position))
    teinte.copy(palette[k]).lerp(palette[k + 1], position - k)
    ;[-1, 1].forEach((cote, j) => {
      q.setFromEuler(new THREE.Euler(0.15 * cote, 0, -cote * 0.95))
      m.compose(new THREE.Vector3(0, y, 0), q, new THREE.Vector3(1, longueur, 1))
      instances.setMatrixAt(i * 2 + j, m)
      instances.setColorAt(i * 2 + j, teinte)
    })
  }
  groupe.add(instances)
  groupe.rotation.z = -0.5
  return groupe
}

function grains(niveau) {
  const groupe = new THREE.Group()
  const hasard = aleatoire(23)
  const matrice = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.75, 2, 8, 24),
    materiau(niveau.matrice, { opacity: 0.25, depthWrite: false, roughness: 0.2 })
  )
  matrice.rotation.z = Math.PI / 2

  const nombre = 70
  const geometrie = new THREE.SphereGeometry(1, 16, 10)
  const instances = new THREE.InstancedMesh(geometrie, materiau(niveau.grain, { roughness: 0.3 }), nombre)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  for (let i = 0; i < nombre; i++) {
    const angle = hasard() * Math.PI * 2
    const r = Math.sqrt(hasard()) * 0.6
    q.setFromEuler(new THREE.Euler(hasard() * 0.4, hasard() * 0.4, (hasard() - 0.5) * 0.5))
    m.compose(
      new THREE.Vector3((hasard() - 0.5) * 2.4, Math.cos(angle) * r, Math.sin(angle) * r),
      q,
      new THREE.Vector3(0.13, 0.055, 0.055)
    )
    instances.setMatrixAt(i, m)
  }
  groupe.add(instances, matrice)
  groupe.userData.inclinaison = -0.25
  return groupe
}

function plaques(niveau) {
  const groupe = new THREE.Group()
  const hasard = aleatoire(5)
  const points = grilleHexagonale(0.62, 1.75)
  const geometrie = new THREE.CylinderGeometry(0.31, 0.33, 0.12, 6)
  geometrie.rotateX(Math.PI / 2)
  geometrie.rotateZ(Math.PI / 6)
  const instances = new THREE.InstancedMesh(geometrie, materiau('#ffffff', { roughness: 0.45, flatShading: true }), points.length)
  const m = new THREE.Matrix4()
  const teinte = new THREE.Color()
  points.forEach((p, i) => {
    m.compose(new THREE.Vector3(p.x, p.y, hasard() * 0.04), new THREE.Quaternion(), new THREE.Vector3(1, 1, 0.7 + hasard() * 0.6))
    instances.setMatrixAt(i, m)
    instances.setColorAt(i, teinte.set(niveau.couleurs[Math.floor(hasard() * niveau.couleurs.length)]))
  })
  const fond = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), materiau('#3b2a1c'))
  fond.position.z = -0.07
  groupe.add(fond, instances)
  groupe.userData.inclinaison = -0.45
  return groupe
}

function cylindreEntre(a, b, rayon, mat) {
  const direction = new THREE.Vector3().subVectors(b, a)
  const cylindre = new THREE.Mesh(new THREE.CylinderGeometry(rayon, rayon, direction.length(), 8), mat)
  cylindre.position.copy(a).addScaledVector(direction, 0.5)
  cylindre.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return cylindre
}

function moleculeEnBoules(niveau) {
  const groupe = new THREE.Group()
  const { atomes, liaisons } = molecule(niveau.molecule)

  const centre = new THREE.Vector3()
  atomes.forEach((a) => centre.add(new THREE.Vector3(a.x, a.y, a.z)))
  centre.divideScalar(atomes.length)
  const positions = atomes.map((a) => new THREE.Vector3(a.x, a.y, a.z).sub(centre))
  const rayon = Math.max(...positions.map((p) => p.length()))
  const echelle = 1.55 / rayon

  const sphere = new THREE.SphereGeometry(1, 24, 16)
  const materiaux = Object.fromEntries(
    Object.entries(COULEURS_ATOMES).map(([e, c]) => [e, materiau(c, { roughness: 0.3, metalness: 0.05 })])
  )
  positions.forEach((p, i) => {
    const e = atomes[i].e
    const boule = new THREE.Mesh(sphere, materiaux[e])
    boule.position.copy(p).multiplyScalar(echelle)
    boule.scale.setScalar(RAYONS_ATOMES[e] * echelle * 0.9)
    groupe.add(boule)
  })

  const lien = materiau('#FBF0DE', { roughness: 0.4 })
  const pointille = materiau('#3DBDB5', { roughness: 0.4 })
  const perle = new THREE.SphereGeometry(0.035 * echelle, 8, 6)
  liaisons.forEach(({ a, b, ordre }) => {
    const pa = positions[a].clone().multiplyScalar(echelle)
    const pb = positions[b].clone().multiplyScalar(echelle)
    if (ordre === 0) {
      const pas = Math.max(3, Math.round(pa.distanceTo(pb) / (0.16 * echelle)))
      for (let k = 1; k < pas; k++) {
        const point = new THREE.Mesh(perle, pointille)
        point.position.lerpVectors(pa, pb, k / pas)
        groupe.add(point)
      }
      return
    }
    if (ordre === 1) {
      groupe.add(cylindreEntre(pa, pb, 0.07 * echelle, lien))
      return
    }
    const decalage = new THREE.Vector3()
      .subVectors(pb, pa)
      .cross(new THREE.Vector3(0, 0, 1))
      .normalize()
      .multiplyScalar(0.08 * echelle)
    groupe.add(
      cylindreEntre(pa.clone().add(decalage), pb.clone().add(decalage), 0.045 * echelle, lien),
      cylindreEntre(pa.clone().sub(decalage), pb.clone().sub(decalage), 0.045 * echelle, lien)
    )
  })
  groupe.userData.tourne = true
  return groupe
}

const GENERATEURS = { photo, domes, cellules, plume, grains, plaques, molecule: moleculeEnBoules }

export function construireNiveau(niveau, fresque) {
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xfbf0de, 0x2b2660, 1.7))
  const soleil = new THREE.DirectionalLight(0xffffff, 1.6)
  soleil.position.set(2, 3, 4)
  scene.add(soleil)

  const pivot = new THREE.Group()
  const contenu = GENERATEURS[niveau.type](niveau, fresque)
  pivot.add(contenu)
  scene.add(pivot)

  const materiaux = new Set()
  contenu.traverse((o) => {
    if (!o.material) return
    o.material.transparent = true
    o.material.userData.opacite ??= o.material.opacity
    materiaux.add(o.material)
  })

  return { scene, pivot, contenu, materiaux, type: niveau.type }
}

export function libererNiveau({ scene }) {
  scene.traverse((o) => {
    o.geometry?.dispose()
    o.material?.map?.dispose()
    o.material?.dispose()
  })
}
