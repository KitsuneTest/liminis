// stores/progression.js
// -----------------------------------------------------------------------------
// COLONNE VERTÉBRALE DU DISPOSITIF
// Store central qui garde toute la progression du parcours et la synchronise
// automatiquement dans IndexedDB (via localForage). Aucun compte, aucun serveur :
// la progression survit au rechargement de la page tant que l'utilisateur reste
// sur le même navigateur/appareil.
//
// Prérequis :  npm install pinia localforage
// -----------------------------------------------------------------------------

import { defineStore } from 'pinia'
import localforage from 'localforage'

// --- Configuration des fresques ---------------------------------------------
// La config vit dans src/data/fresques.js (coordonnées, fragments, cibles AR).
import { FRESQUES } from '../data/fresques'
export { FRESQUES }

const CLE_STOCKAGE = 'progression-parcours'

// --- Distance entre deux points GPS en mètres (formule de Haversine) ---------
// Le cos(latitude) corrige automatiquement la déformation selon la latitude.
function distanceMetres(a, b) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// --- État initial (aussi utilisé pour la réinitialisation) -------------------
function etatInitial() {
  return {
    hydrate: false, // passe à true une fois les données chargées depuis IndexedDB
    fresques: Object.fromEntries(
      FRESQUES.map((f) => [
        f.id,
        {
          tampon: false,   // présence validée (géoloc ou secours)
          fragments: [],   // ids des fragments collectés en AR
        },
      ])
    ),
    quiz: { termine: false, reponses: [] }, // quiz de personnalité
    familier: null,                          // { id, nom } une fois débloqué
  }
}

export const useProgression = defineStore('progression', {
  state: () => etatInitial(),

  getters: {
    // Config d'une fresque par son id
    fresqueConfig: () => (id) => FRESQUES.find((f) => f.id === id),

    // Tous les fragments d'une fresque sont collectés ?
    fresqueComplete: (state) => (id) => {
      const cfg = FRESQUES.find((f) => f.id === id)
      if (!cfg) return false
      return (state.fresques[id]?.fragments.length ?? 0) >= cfg.nbFragments
    },

    // La page microscopique se débloque quand tous les fragments sont collectés
    microscopiqueDebloquee() {
      return (id) => this.fresqueComplete(id)
    },

    // Nombre de tampons obtenus
    nbTampons: (state) =>
      Object.values(state.fresques).filter((f) => f.tampon).length,

    // Les 3 tampons sont collectés ?
    tousTamponsCollectes() {
      return this.nbTampons >= FRESQUES.length
    },

    // La page familier n'est disponible qu'avec les 3 tampons
    pageFamilierDisponible() {
      return this.tousTamponsCollectes
    },

    familierDebloque: (state) => state.familier !== null,

    // Petit récapitulatif pratique pour l'affichage du carnet
    resume() {
      return {
        tampons: this.nbTampons,
        totalFresques: FRESQUES.length,
        familier: this.familier,
      }
    },
  },

  actions: {
    // -- À appeler une seule fois au démarrage de l'app -----------------------
    async hydrater() {
      const sauvegarde = await localforage.getItem(CLE_STOCKAGE)
      if (sauvegarde) this.$patch(sauvegarde)
      this.hydrate = true

      // Persistance automatique : à chaque changement d'état, on réécrit dans
      // IndexedDB. JSON.parse(JSON.stringify(...)) sérialise proprement l'état.
      this.$subscribe((_mutation, state) => {
        localforage.setItem(CLE_STOCKAGE, JSON.parse(JSON.stringify(state)))
      })
    },

    // -- Détection de zone : à brancher sur watchPosition --------------------
    // Renvoie l'id de la fresque validée (ou null). On ajoute la marge
    // d'incertitude (accuracy) au rayon pour ne pas rater une entrée légitime.
    verifierZone(userPos, accuracy = 0) {
      // Signal trop imprécis : on n'affirme rien.
      if (accuracy > 40) return null

      for (const f of FRESQUES) {
        if (this.fresques[f.id].tampon) continue // déjà validée
        const d = distanceMetres(userPos, { lat: f.lat, lng: f.lng })
        if (d <= f.rayon + accuracy) {
          this.poserTampon(f.id)
          return f.id
        }
      }
      return null
    },

    // Pose un tampon (utilisé par la géoloc, ou par un QR de secours)
    poserTampon(id) {
      if (this.fresques[id] && !this.fresques[id].tampon) {
        this.fresques[id].tampon = true
      }
    },

    // Collecte d'un fragment en AR (idempotent : pas de doublon)
    collecterFragment(fresqueId, fragmentId) {
      const f = this.fresques[fresqueId]
      if (f && !f.fragments.includes(fragmentId)) {
        f.fragments.push(fragmentId)
      }
    },

    // Enregistre les réponses du quiz de personnalité
    repondreQuiz(reponses) {
      this.quiz.reponses = reponses
      this.quiz.termine = true
    },

    // Débloque le familier (exige les 3 tampons + le quiz terminé)
    debloquerFamilier(familier) {
      if (this.tousTamponsCollectes && this.quiz.termine) {
        this.familier = familier // ex. { id: 'renard', nom: 'Renard curieux' }
        return true
      }
      return false
    },

    // Export du carnet : télécharge un fichier JSON de toute la progression
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

    // Remet tout à zéro (utile pour tester à plusieurs)
    async reinitialiser() {
      await localforage.removeItem(CLE_STOCKAGE)
      this.$patch(etatInitial())
    },
  },
})
