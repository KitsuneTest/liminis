<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'
import ScanneurAR from '../components/ScanneurAR.vue'

const route = useRoute()
const progression = useProgression()

const id = route.params.id
const config = computed(() => progression.fresqueConfig(id))
const etat = computed(() => progression.fresques[id] ?? { tampon: false, fragments: [] })
const complete = computed(() => progression.fresqueComplete(id))

const dernier = ref(null)

function collecter(fragmentId) {
  progression.collecterFragment(id, fragmentId)
  dernier.value = fragmentId
  setTimeout(() => { dernier.value = null }, 2500)
}
</script>

<template>
  <section v-if="config" class="pile">
    <header>
      <p class="surtitre">Étape 2 — devant la fresque</p>
      <h1 class="titre-chapitre">{{ config.nom }}</h1>
      <p class="legende sous">{{ config.sousTitre }}</p>
    </header>

    <!-- Fragment beads: what is left to find -->
    <div class="chapelet" :aria-label="`${etat.fragments.length} fragments sur ${config.nbFragments}`">
      <span
        v-for="n in config.nbFragments"
        :key="n"
        class="perle"
        :class="{ 'perle--pleine': etat.fragments.includes(`frag-${n}`) }"
      ></span>
      <span class="chapelet__compte">
        {{ etat.fragments.length }} / {{ config.nbFragments }}
      </span>
    </div>

    <ScanneurAR
      :collectes="etat.fragments"
      :nb-fragments="config.nbFragments"
      :teinte-cible="config.teinteCible"
      @collecte="collecter"
    />

    <p v-if="dernier" class="bandeau-ok" role="status">✦ Fragment ajouté au carnet</p>

    <!-- Mural finished: open what comes next -->
    <div v-if="complete" class="feuille feuille--cousue fin">
      <p class="surtitre">Fresque complète</p>
      <h2>Tous les fragments sont réunis</h2>
      <p class="legende">La vision d'échelles est maintenant accessible.</p>
      <RouterLink class="bouton bouton--accent bouton--bloc" :to="`/fresque/${id}/microscopique`">
        Voir la vision microscopique
      </RouterLink>
    </div>

    <div v-else class="feuille feuille--teintee aide">
      <img
        class="aide__photo"
        :src="config.photo"
        :style="{ objectPosition: config.cadrage }"
        :alt="`Fresque ${config.nom}`"
        loading="lazy"
        decoding="async"
      />
      <p class="legende">
        Voici le mur à chercher. Reculez d'un pas et cadrez-le en entier : les
        fragments flottent devant lui, touchez-les pour les récolter. Rien ne se
        perd, vous pouvez fermer la caméra et revenir plus tard.
      </p>
    </div>

    <RouterLink class="retour" :to="{ name: 'tampon-detail', params: { id } }">← Retour à la fiche</RouterLink>
  </section>

  <section v-else class="feuille">
    <h1>Fresque inconnue</h1>
    <p class="legende">Aucune fresque ne porte l'identifiant « {{ id }} ».</p>
    <RouterLink class="bouton bouton--secondaire" to="/parcours">Retour au parcours</RouterLink>
  </section>
</template>

<style scoped>
.sous {
  font-family: var(--serif);
  font-style: italic;
  font-size: 1rem;
  margin-top: 0.2rem;
}

/* --- Fragment beads -------------------------------------------------------- */
.chapelet {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: var(--papier-clair);
  border: 1px solid var(--ligne);
  box-shadow: var(--ombre-1);
  align-self: flex-start;
}
.perle {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px dashed var(--kraft-fonce);
  background: transparent;
  transition: background 0.3s ease, transform 0.3s ease;
}
.perle--pleine {
  border-style: solid;
  border-color: var(--mousse);
  background: var(--mousse);
  transform: scale(1.12);
}
.chapelet__compte {
  margin-left: 0.3rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--encre-douce);
}

.bandeau-ok {
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--vert-valide);
  background: var(--mousse-clair);
  border: 1px solid var(--vert-valide);
  border-radius: 999px;
  padding: 0.5rem;
}

.aide { display: flex; flex-direction: column; gap: 0.85rem; }
.aide__photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--rayon-s);
  border: 1px solid var(--ligne);
}

.fin { display: flex; flex-direction: column; gap: 0.55rem; text-align: center; }
.fin .bouton { margin-top: 0.4rem; }

.retour {
  align-self: center;
  font-size: 0.85rem;
  color: var(--encre-douce);
  text-decoration: none;
  border-bottom: 1px dashed var(--kraft);
}
</style>
