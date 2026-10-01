import * as THREE from 'three'

let textureHalo = null

function halo() {
  if (textureHalo) return textureHalo
  const canvas = Object.assign(document.createElement('canvas'), { width: 64, height: 64 })
  const ctx = canvas.getContext('2d')
  const degrade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  degrade.addColorStop(0, 'rgba(255,255,255,1)')
  degrade.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  degrade.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = degrade
  ctx.fillRect(0, 0, 64, 64)
  textureHalo = new THREE.CanvasTexture(canvas)
  return textureHalo
}

export function creerFragment(couleur, graine = 0) {
  const groupe = new THREE.Group()

  const geometrie = new THREE.OctahedronGeometry(1, 0)
  geometrie.scale(0.55, 1, 0.55)
  const cristal = new THREE.Mesh(
    geometrie,
    new THREE.MeshStandardMaterial({
      color: couleur,
      emissive: couleur,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.15,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    })
  )

  const lueur = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: halo(),
      color: couleur,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  )
  lueur.scale.setScalar(3.4)

  const zone = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 8, 8),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
  )

  groupe.add(lueur, cristal, zone)
  groupe.userData = { cristal, lueur, zone, graine, collecte: null }
  return groupe
}

export function animerFragment(fragment, temps, dt) {
  const { cristal, lueur, graine, collecte } = fragment.userData
  cristal.rotation.y += dt * 0.9
  cristal.rotation.z = Math.sin(temps * 0.7 + graine) * 0.25

  if (collecte === null) {
    const souffle = 0.5 + 0.5 * Math.sin(temps * 1.5 + graine * 2.1)
    cristal.position.z = 0.6 + souffle * 0.5
    lueur.material.opacity = 0.18 + souffle * 0.4
    return false
  }

  const p = Math.min(1, (temps - collecte) / 0.5)
  fragment.scale.setScalar(fragment.userData.taille * (1 + p * 1.8))
  cristal.position.z += dt * 30
  cristal.rotation.y += dt * 12
  cristal.material.opacity = 0.9 * (1 - p)
  lueur.material.opacity = 0.9 * (1 - p)
  return p >= 1
}

export function libererObjet(objet) {
  objet.traverse((o) => {
    o.geometry?.dispose()
    const materiaux = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    materiaux.forEach((m) => m.dispose())
  })
}
