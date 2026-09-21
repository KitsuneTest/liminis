import { onUnmounted, ref } from 'vue'
import { useProgression } from '../stores/progression'

// Suit la position et laisse le store valider l'entrée dans une zone.
export function useGeoloc() {
  const progression = useProgression()
  const erreur = ref(null)
  const precision = ref(null)
  let watchId = null

  function demarrer(onTampon) {
    if (!('geolocation' in navigator)) {
      erreur.value = "La géolocalisation n'est pas disponible sur cet appareil."
      return
    }
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        erreur.value = null
        precision.value = Math.round(pos.coords.accuracy)
        const validee = progression.verifierZone(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          pos.coords.accuracy
        )
        if (validee) onTampon?.(validee)
      },
      (err) => { erreur.value = err.message },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }

  function arreter() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  onUnmounted(arreter)
  return { demarrer, arreter, erreur, precision }
}
