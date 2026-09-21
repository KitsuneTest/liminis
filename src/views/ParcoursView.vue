<script setup>
import { computed, onMounted, ref } from 'vue'
import { useProgression, FRESQUES, distanceMetres } from '../stores/progression'
import { useGeoloc } from '../composables/useGeoloc'
import CarteParcours from '../components/CarteParcours.vue'

const progression = useProgression()
const { demarrer, position, erreur, precision, statut } = useGeoloc()

const carte = ref(null)
const annonce = ref('')

onMounted(() => {
  demarrer((fresqueId) => {
    const f = FRESQUES.find((x) => x.id === fresqueId)
    annonce.value = `Tampon obtenu : ${f?.nom ?? fresqueId} !`
    setTimeout(() => { annonce.value = '' }, 6000)
  })
})

const distances = computed(() => {
  if (!position.value) return {}
  return Object.fromEntries(
    FRESQUES.map((f) => [f.id, distanceMetres(position.value, { lat: f.lat, lng: f.lng })])
  )
})

function formaterDistance(m) {
  if (m == null) return null
  if (m < 1000) return `${Math.round(m)} m`
  const km = m / 1000
  // A decimal is only meaningful while you could still walk it.
  return km < 100 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

// Beyond 2 km the automatic stamp will never land: either not on site yet, or
// the placeholder coordinates in src/data/fresques.js are still in place.
const horsZone = computed(() => {
  const d = Object.values(distances.value)
  return d.length > 0 && Math.min(...d) > 2000
})

const progressionPct = computed(
  () => (progression.nbTampons / FRESQUES.length) * 100
)
</script>

<template>
  <section class="pile">
    <header class="entete">
      <div>
        <p class="surtitre">Étape 1 — sur le terrain</p>
        <h1 class="titre-chapitre">Parcours</h1>
      </div>
      <div class="compteur" :aria-label="`${progression.nbTampons} tampons sur ${FRESQUES.length}`">
        <b>{{ progression.nbTampons }}</b><span>/{{ FRESQUES.length }}</span>
      </div>
    </header>

    <div class="jauge">
      <div class="jauge__valeur" :style="{ width: progressionPct + '%' }"></div>
    </div>

    <!-- The map: the component that was missing -->
    <CarteParcours
      ref="carte"
      :fresques="FRESQUES"
      :etats="progression.fresques"
      :position="position"
      @choisir="(id) => $router.push(`/fresque/${id}`)"
    />

    <!-- Geolocation status -->
    <p v-if="annonce" class="bandeau bandeau--ok" role="status">✓ {{ annonce }}</p>
    <p v-if="erreur" class="bandeau bandeau--alerte" role="alert">{{ erreur }}</p>
    <p v-else-if="statut === 'recherche'" class="bandeau">Recherche du signal GPS…</p>
    <p v-else-if="precision" class="bandeau">
      Position suivie — précision ~{{ precision }} m
    </p>

    <!-- Safety net: placeholder coordinates, or user far from the trail -->
    <div v-if="horsZone" class="feuille feuille--teintee avertissement">
      <p class="surtitre">Repères lointains</p>
      <p class="legende">
        Vous êtes à plus de 2 km du campus de Nouville. Si vous n'êtes pas encore
        parti, c'est normal — la carte reste centrée sur l'UNC en attendant. En
        attendant, validez les étapes à la main ci-dessous.
      </p>
    </div>

    <!-- The murals -->
    <h2 class="titre-chapitre">Les trois fresques</h2>

    <article
      v-for="(f, i) in FRESQUES"
      :key="f.id"
      class="feuille fiche"
      :class="`fiche--${f.couleur}`"
    >
      <div class="fiche__haut">
        <div
          class="tampon"
          :class="{ 'tampon--vide': !progression.fresques[f.id].tampon }"
          :style="{ '--teinte': `var(--${f.couleur})` }"
        >
          <span class="tampon__num">{{ progression.fresques[f.id].tampon ? '✓' : i + 1 }}</span>
          <span class="tampon__txt">{{
            progression.fresques[f.id].tampon ? 'visitée' : 'à venir'
          }}</span>
        </div>

        <div class="fiche__texte">
          <h3>{{ f.nom }}</h3>
          <p class="fiche__sous">{{ f.sousTitre }}</p>
          <p class="legende fiche__indice">« {{ f.indice }} »</p>
        </div>
      </div>

      <div class="fiche__meta">
        <span v-if="distances[f.id] != null" class="puce puce--attente puce--mesure">
          ◎ {{ formaterDistance(distances[f.id]) }}
        </span>
        <span
          class="puce"
          :class="progression.fresqueComplete(f.id) ? 'puce--ok' : 'puce--attente'"
        >
          {{ progression.fresques[f.id].fragments.length }}/{{ f.nbFragments }} fragments
        </span>
      </div>

      <div class="fiche__actions">
        <button class="bouton bouton--petit bouton--secondaire" type="button" @click="carte?.centrerSur(f.id)">
          Voir sur la carte
        </button>
        <RouterLink class="bouton bouton--petit" :to="`/fresque/${f.id}`">
          Ouvrir la caméra
        </RouterLink>
        <button
          v-if="!progression.fresques[f.id].tampon"
          class="bouton bouton--petit bouton--secondaire"
          type="button"
          @click="progression.poserTampon(f.id)"
        >
          Je suis sur place
        </button>
      </div>
    </article>

    <p class="legende note-bas">
      Le tampon se pose tout seul dès que vous entrez dans la zone. Si le GPS
      décroche, « Je suis sur place » fait le même travail.
    </p>
  </section>
</template>

<style scoped>
.entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}
.entete .titre-chapitre::after { display: none; }

.compteur {
  flex: none;
  display: flex;
  align-items: baseline;
  font-family: var(--serif);
  color: var(--encre);
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--ligne-forte);
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--ombre-1);
}
.compteur b { font-size: 1.35rem; }
.compteur span { font-size: 0.85rem; color: var(--encre-douce); }

/* --- Banners --------------------------------------------------------------- */
.bandeau {
  font-size: 0.82rem;
  color: var(--encre-douce);
  text-align: center;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: var(--papier-clair);
  border: 1px solid var(--ligne);
  box-shadow: var(--ombre-1);
}
.bandeau--ok {
  color: var(--vert-valide);
  font-weight: 700;
  background: var(--mousse-clair);
  border-color: var(--vert-valide);
}
.bandeau--alerte {
  color: var(--rouge-tampon);
  background: var(--terre-clair);
  border-color: var(--rouge-tampon);
  border-radius: var(--rayon-s);
}

.avertissement code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.78em;
  background: var(--papier-ombre);
  padding: 1px 4px;
  border-radius: 4px;
}

/* --- Mural card ------------------------------------------------------------ */
.fiche {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  /* colour rule down the left edge */
  border-left-width: 4px;
  border-left-color: var(--teinte-fiche, var(--kraft-fonce));
}
.fiche--mousse { --teinte-fiche: var(--mousse); }
.fiche--lagon  { --teinte-fiche: var(--lagon); }
.fiche--prune  { --teinte-fiche: var(--prune); }

.fiche__haut { display: flex; gap: 0.9rem; align-items: flex-start; }
.fiche__texte { min-width: 0; }
.fiche__sous {
  font-family: var(--serif);
  font-style: italic;
  color: var(--teinte-fiche, var(--encre-douce));
  font-size: 0.95rem;
}
.fiche__indice { margin-top: 0.3rem; }

.fiche__meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.fiche__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--kraft);
}

.note-bas { text-align: center; padding: 0 0.5rem; }
</style>
