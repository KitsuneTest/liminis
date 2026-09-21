// stores/progression.js
// -----------------------------------------------------------------------------
// BACKBONE OF THE WHOLE EXPERIENCE
// Central store holding all trail progress, synced automatically to IndexedDB
// through localForage. No account, no server: progress survives a page reload
// as long as the visitor stays on the same browser and device.
//
// Requires: npm install pinia localforage
// -----------------------------------------------------------------------------

import { defineStore } from 'pinia'
import localforage from 'localforage'

// --- Mural configuration -----------------------------------------------------
// Lives in src/data/fresques.js (coordinates, fragments, AR targets).
import { FRESQUES } from '../data/fresques'
export { FRESQUES }

const CLE_STOCKAGE = 'progression-parcours'

// Kept out of the state: a promise must not be serialised.
let promesseHydratation = null

// --- Distance between two GPS points, in metres (haversine) ------------------
// The cos(latitude) term corrects the distortion that grows with latitude.
export function distanceMetres(a, b) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// --- Initial state (also used when resetting) --------------------------------
function etatInitial() {
  return {
    hydrate: false, // flips to true once IndexedDB has been read
    fresques: Object.fromEntries(
      FRESQUES.map((f) => [
        f.id,
        {
          tampon: false,   // presence confirmed (GPS or manual fallback)
          fragments: [],   // ids of fragments collected in AR
        },
      ])
    ),
    quiz: { termine: false, reponses: [] }, // personality quiz
    familier: null,                          // { id, nom } once unlocked
  }
}

export const useProgression = defineStore('progression', {
  state: () => etatInitial(),

  getters: {
    // A mural config, by id
    fresqueConfig: () => (id) => FRESQUES.find((f) => f.id === id),

    // Have all fragments of a mural been collected?
    fresqueComplete: (state) => (id) => {
      const cfg = FRESQUES.find((f) => f.id === id)
      if (!cfg) return false
      return (state.fresques[id]?.fragments.length ?? 0) >= cfg.nbFragments
    },

    // The microscopic page unlocks once every fragment is collected
    microscopiqueDebloquee() {
      return (id) => this.fresqueComplete(id)
    },

    // How many stamps have been earned
    nbTampons: (state) =>
      Object.values(state.fresques).filter((f) => f.tampon).length,

    // Are all 3 stamps collected?
    tousTamponsCollectes() {
      return this.nbTampons >= FRESQUES.length
    },

    // The companion page needs all 3 stamps
    pageFamilierDisponible() {
      return this.tousTamponsCollectes
    },

    familierDebloque: (state) => state.familier !== null,

    // Handy summary for the notebook view
    resume() {
      return {
        tampons: this.nbTampons,
        totalFresques: FRESQUES.length,
        familier: this.familier,
      }
    },
  },

  actions: {
    // Waits for progress to be read. Idempotent: reads only once.
    pret() {
      if (!promesseHydratation) promesseHydratation = this.hydrater()
      return promesseHydratation
    },

    // The actual read: go through pret() instead.
    async hydrater() {
      let sauvegarde = null
      try {
        sauvegarde = await localforage.getItem(CLE_STOCKAGE)
      } catch {
        // Storage blocked (private browsing): start from a fresh state.
        sauvegarde = null
      }
      if (sauvegarde) this.$patch(sauvegarde)

      // An older save may not match the current murals: top up what is missing
      // and drop renamed ids, which would otherwise inflate nbTampons.
      const connus = new Set(FRESQUES.map((f) => f.id))
      for (const id of Object.keys(this.fresques)) {
        if (!connus.has(id)) delete this.fresques[id]
      }
      for (const f of FRESQUES) {
        if (!this.fresques[f.id]) this.fresques[f.id] = { tampon: false, fragments: [] }
        else if (!Array.isArray(this.fresques[f.id].fragments))
          this.fresques[f.id].fragments = []
      }

      this.hydrate = true

      // Automatic persistence: every state change is written back to IndexedDB.
      // JSON.parse(JSON.stringify(...)) gives a clean serialisable snapshot.
      this.$subscribe((_mutation, state) => {
        localforage.setItem(CLE_STOCKAGE, JSON.parse(JSON.stringify(state)))
      })
    },

    // -- Zone detection: wire this to watchPosition --------------------------
    // Returns the id of the validated mural, or null. The accuracy margin is
    // added to the radius so a legitimate arrival is never missed.
    verifierZone(userPos, accuracy = 0) {
      // Signal too rough to claim anything.
      if (accuracy > 40) return null

      // Two murals sit ~30 m apart, so their zones overlap: take the closest
      // one rather than the first that matches.
      let gagnante = null
      let meilleure = Infinity
      for (const f of FRESQUES) {
        if (this.fresques[f.id].tampon) continue // already validated
        const d = distanceMetres(userPos, { lat: f.lat, lng: f.lng })
        if (d <= f.rayon + accuracy && d < meilleure) {
          meilleure = d
          gagnante = f.id
        }
      }
      if (gagnante) this.poserTampon(gagnante)
      return gagnante
    },

    // Lays down a stamp (used by GPS, or by a fallback QR code)
    poserTampon(id) {
      if (this.fresques[id] && !this.fresques[id].tampon) {
        this.fresques[id].tampon = true
      }
    },

    // Collects an AR fragment (idempotent: no duplicates)
    collecterFragment(fresqueId, fragmentId) {
      const f = this.fresques[fresqueId]
      if (f && !f.fragments.includes(fragmentId)) {
        f.fragments.push(fragmentId)
      }
    },

    // Records the personality quiz answers
    repondreQuiz(reponses) {
      this.quiz.reponses = reponses
      this.quiz.termine = true
    },

    // Unlocks the companion (needs all 3 stamps and a finished quiz)
    debloquerFamilier(familier) {
      if (this.tousTamponsCollectes && this.quiz.termine) {
        this.familier = familier // e.g. { id: 'renard', nom: 'Renard curieux' }
        return true
      }
      return false
    },

    // Notebook export: downloads the whole progress as a JSON file
    exporterJSON() {
      const donnees = {
        exporteLe: new Date().toISOString(),
        fresques: this.fresques,
        quiz: this.quiz,
        familier: this.familier,
      }
      const blob = new Blob([JSON.stringify(donnees, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `carnet-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },

    // Wipes everything (handy when several people test on one device)
    async reinitialiser() {
      await localforage.removeItem(CLE_STOCKAGE)
      this.$patch(etatInitial())
    },
  },
})
