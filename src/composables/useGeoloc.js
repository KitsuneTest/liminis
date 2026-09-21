import { onUnmounted, ref } from 'vue'
import { useProgression } from '../stores/progression'

// Tracks position and lets the store validate entry into a zone.
// The position is exposed: without it the map cannot place the user.
export function useGeoloc() {
  const progression = useProgression()

  const position = ref(null) // { lat, lng, accuracy }
  const erreur = ref(null)
  const precision = ref(null)
  const statut = ref('inactif') // idle | searching | tracking | error

  let watchId = null

  function demarrer(onTampon) {
    if (watchId !== null) return // already running

    if (!('geolocation' in navigator)) {
      statut.value = 'erreur'
      erreur.value = "La géolocalisation n'est pas disponible sur cet appareil."
      return
    }
    if (!window.isSecureContext) {
      statut.value = 'erreur'
      erreur.value =
        'La géolocalisation exige une connexion sécurisée (https:// ou localhost).'
      return
    }

    statut.value = 'recherche'
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        erreur.value = null
        statut.value = 'suivi'
        precision.value = Math.round(pos.coords.accuracy)
        position.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        const validee = progression.verifierZone(position.value, pos.coords.accuracy)
        if (validee) onTampon?.(validee)
      },
      (err) => {
        statut.value = 'erreur'
        // Native messages are terse: say what to do instead.
        if (err.code === err.PERMISSION_DENIED)
          erreur.value =
            'Localisation refusée. Autorisez-la dans les réglages du site, puis rechargez la page.'
        else if (err.code === err.POSITION_UNAVAILABLE)
          erreur.value = 'Position introuvable. Sortez à découvert et patientez quelques secondes.'
        else if (err.code === err.TIMEOUT)
          erreur.value = 'Le signal GPS met trop de temps à arriver. Réessayez.'
        else erreur.value = err.message
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
  }

  function arreter() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
    if (statut.value !== 'erreur') statut.value = 'inactif'
  }

  onUnmounted(arreter)
  return { demarrer, arreter, position, erreur, precision, statut }
}
