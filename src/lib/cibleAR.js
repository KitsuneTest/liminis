import localforage from 'localforage'

function chargerImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function fichierCompile(url) {
  const reponse = await fetch(url).catch(() => null)
  // Vite's SPA fallback answers a missing file with index.html.
  return reponse?.ok && !reponse.headers.get('content-type')?.includes('text/html') ? url : null
}

function recadrer(img, { x, y, w, h }) {
  const largeur = img.naturalWidth * w
  const hauteur = img.naturalHeight * h
  const echelle = Math.min(1, 1000 / Math.max(largeur, hauteur))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(largeur * echelle)
  canvas.height = Math.round(hauteur * echelle)
  canvas
    .getContext('2d')
    .drawImage(img, img.naturalWidth * x, img.naturalHeight * y, largeur, hauteur, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function preparerCible(fresque, surProgression = () => {}) {
  const img = await chargerImage(fresque.photo)
  const ratio = (img.naturalHeight * fresque.cible.h) / (img.naturalWidth * fresque.cible.w)

  const fichier = await fichierCompile(fresque.cibleAR)
  if (fichier) return { url: fichier, ratio }

  const cle = `cible-ar:${fresque.id}:${JSON.stringify(fresque.cible)}`
  let donnees = await localforage.getItem(cle).catch(() => null)
  if (!donnees) {
    const { Compiler } = await import('mind-ar/dist/mindar-image.prod.js')
    const compilateur = new Compiler()
    await compilateur.compileImageTargets([recadrer(img, fresque.cible)], surProgression)
    donnees = compilateur.exportData()
    await localforage.setItem(cle, donnees).catch(() => {})
  }
  surProgression(100)
  return { url: URL.createObjectURL(new Blob([donnees])), ratio }
}
