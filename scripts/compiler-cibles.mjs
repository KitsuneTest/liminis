// Precompiles the MindAR targets into public/ar/<id>/targets.mind, so the
// browser no longer spends a minute compiling them on first launch.
// Usage: npm run cibles
import { register } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import jpeg from 'jpeg-js'

// The offline compiler imports the native `canvas` package only to read pixels,
// which is done here with jpeg-js instead.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (specifier === 'canvas') return { url: 'data:text/javascript,export const createCanvas = () => null', shortCircuit: true }
        return next(specifier, context)
      }
    `)
)

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const { FRESQUES } = await import('../src/data/fresques.js')
const { OfflineCompiler } = await import('mind-ar/src/image-target/offline-compiler.js')

// Same crop and 1000 px cap as recadrer() in src/lib/cibleAR.js, so the anchors stay valid.
function recadrer({ width, height, data }, { x, y, w, h }) {
  const sx = width * x
  const sy = height * y
  const largeur = width * w
  const hauteur = height * h
  const echelle = Math.min(1, 1000 / Math.max(largeur, hauteur))
  const lo = Math.round(largeur * echelle)
  const ho = Math.round(hauteur * echelle)
  const sortie = new Uint8ClampedArray(lo * ho * 4)
  const pas = 1 / echelle
  for (let j = 0; j < ho; j++) {
    for (let i = 0; i < lo; i++) {
      let r = 0, g = 0, b = 0, n = 0
      const x0 = Math.floor(sx + i * pas)
      const y0 = Math.floor(sy + j * pas)
      const x1 = Math.min(width, Math.max(x0 + 1, Math.floor(sx + (i + 1) * pas)))
      const y1 = Math.min(height, Math.max(y0 + 1, Math.floor(sy + (j + 1) * pas)))
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const k = (yy * width + xx) * 4
          r += data[k]; g += data[k + 1]; b += data[k + 2]; n++
        }
      }
      const k = (j * lo + i) * 4
      sortie[k] = r / n; sortie[k + 1] = g / n; sortie[k + 2] = b / n; sortie[k + 3] = 255
    }
  }
  return { width: lo, height: ho, data: sortie }
}

class Compilateur extends OfflineCompiler {
  createProcessCanvas(img) {
    return {
      getContext: () => ({
        drawImage() {},
        getImageData: () => ({ data: img.data }),
      }),
    }
  }
}

for (const fresque of FRESQUES) {
  const photo = jpeg.decode(await readFile(join(racine, 'public', fresque.photo)), {
    useTArray: true,
    maxMemoryUsageInMB: 1024,
  })
  const image = recadrer(photo, fresque.cible)
  const compilateur = new Compilateur()
  let palier = 0
  await compilateur.compileImageTargets([image], (p) => {
    if (p >= palier) {
      process.stdout.write(`\r${fresque.id} ${Math.round(p)} %   `)
      palier = Math.ceil(p / 10) * 10
    }
  })
  const destination = join(racine, 'public', fresque.cibleAR)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, compilateur.exportData())
  console.log(`\r${fresque.id} → ${fresque.cibleAR} (${image.width}×${image.height})`)
}
