<script setup>
import { computed } from 'vue'
import { useProgression, FRESQUES } from '../stores/progression'

const progression = useProgression()

const total = computed(() =>
  FRESQUES.reduce((n, f) => n + progression.fresques[f.id].fragments.length, 0)
)
const totalPossible = computed(() => FRESQUES.reduce((n, f) => n + f.nbFragments, 0))
const acheve = computed(() => progression.tousTamponsCollectes && total.value === totalPossible.value)

// `window` is not in scope inside a Vue template.
const imprimer = () => window.print()
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Votre trace</p>
      <h1 class="titre-chapitre">Mon carnet</h1>
    </header>

    <!-- Stamp page: the heart of the notebook -->
    <div class="feuille feuille--cousue page-tampons">
      <p class="surtitre page-tampons__titre">Les trois tampons</p>

      <div class="grille-tampons">
        <div v-for="(f, i) in FRESQUES" :key="f.id" class="case">
          <div
            class="tampon"
            :class="{ 'tampon--vide': !progression.fresques[f.id].tampon }"
            :style="{ '--teinte': `var(--${f.couleur})` }"
          >
            <span class="tampon__num">{{ progression.fresques[f.id].tampon ? '✓' : i + 1 }}</span>
            <span class="tampon__txt">{{ f.sousTitre }}</span>
          </div>
          <p class="case__nom">{{ f.nom }}</p>
        </div>
      </div>

      <hr class="separateur" />

      <p class="bilan">
        <b>{{ total }}</b> fragment(s) sur {{ totalPossible }} ·
        <b>{{ progression.nbTampons }}</b> tampon(s) sur {{ FRESQUES.length }}
      </p>
    </div>

    <!-- Mural by mural -->
    <article v-for="f in FRESQUES" :key="f.id" class="feuille fiche" :class="`fiche--${f.couleur}`">
      <div class="fiche__haut">
        <h2>{{ f.nom }}</h2>
        <span
          class="puce"
          :class="progression.fresques[f.id].tampon ? 'puce--ok' : 'puce--attente'"
        >
          {{ progression.fresques[f.id].tampon ? 'visitée' : 'non visitée' }}
        </span>
      </div>

      <div class="perles">
        <span
          v-for="n in f.nbFragments"
          :key="n"
          class="perle"
          :class="{ 'perle--pleine': progression.fresques[f.id].fragments.includes(`frag-${n}`) }"
        ></span>
        <span class="perles__compte">
          {{ progression.fresques[f.id].fragments.length }} / {{ f.nbFragments }}
        </span>
      </div>

      <RouterLink
        v-if="progression.fresqueComplete(f.id)"
        class="lien-suite"
        :to="`/fresque/${f.id}/microscopique`"
      >
        Revoir la vision d'échelles →
      </RouterLink>
      <RouterLink v-else class="lien-suite" :to="`/fresque/${f.id}`">
        Continuer la collecte →
      </RouterLink>
    </article>

    <!-- Companion -->
    <div class="feuille feuille--teintee familier">
      <div class="tampon" :class="{ 'tampon--vide': !progression.familierDebloque }"
           style="--teinte: var(--prune)">
        <span class="tampon__num">❀</span>
      </div>
      <div class="familier__texte">
        <h3>{{ progression.familier?.nom ?? 'Familier endormi' }}</h3>
        <p class="legende">
          {{
            progression.familierDebloque
              ? 'Il vous accompagne désormais.'
              : 'Les trois tampons puis le questionnaire le réveilleront.'
          }}
        </p>
      </div>
      <RouterLink
        v-if="progression.pageFamilierDisponible"
        class="bouton bouton--petit"
        to="/familier"
      >Ouvrir</RouterLink>
    </div>

    <p v-if="acheve" class="acheve">Parcours achevé. Le carnet est complet.</p>

    <div class="outils">
      <button class="bouton bouton--secondaire bouton--petit" type="button" @click="progression.exporterJSON()">
        Sauvegarde (JSON)
      </button>
      <button class="bouton bouton--secondaire bouton--petit" type="button" @click="imprimer">
        Imprimer
      </button>
    </div>

    <p class="legende note">
      Votre progression est enregistrée sur cet appareil, sans compte ni serveur.
      L'export PDF illustré arrive avec le composant <code>CarnetImprimable.vue</code>.
    </p>
  </section>
</template>

<style scoped>
.page-tampons { text-align: center; }
.page-tampons__titre { margin-bottom: 0.9rem; }

.grille-tampons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}
.case { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
/* Centrepiece of the notebook: one size up. */
.case .tampon { --taille: 84px; }
.case__nom { font-size: 0.72rem; font-weight: 700; color: var(--encre-douce); }

.bilan { font-size: 0.86rem; color: var(--encre-douce); }
.bilan b { font-family: var(--serif); font-size: 1.1rem; color: var(--encre); }

/* --- Cards ----------------------------------------------------------------- */
.fiche {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-left-width: 4px;
  border-left-color: var(--teinte-fiche, var(--kraft-fonce));
}
.fiche--mousse { --teinte-fiche: var(--mousse); }
.fiche--lagon  { --teinte-fiche: var(--lagon); }
.fiche--prune  { --teinte-fiche: var(--prune); }

.fiche__haut {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.perles { display: flex; align-items: center; gap: 0.4rem; }
.perle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px dashed var(--kraft-fonce);
}
.perle--pleine {
  border-style: solid;
  border-color: var(--teinte-fiche);
  background: var(--teinte-fiche);
}
.perles__compte { margin-left: 0.3rem; font-size: 0.76rem; color: var(--encre-douce); }

.lien-suite {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--teinte-fiche);
  text-decoration: none;
}

/* --- Companion ------------------------------------------------------------- */
.familier { display: flex; align-items: center; gap: 0.9rem; }
/* `> div` also caught the stamp, which then stretched into an ellipse. */
.familier__texte { flex: 1; min-width: 0; }

.acheve {
  text-align: center;
  font-family: var(--serif);
  font-size: 1.05rem;
  color: var(--vert-valide);
}

.outils { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
.note { text-align: center; }
.note code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.78em;
  background: var(--papier-ombre);
  padding: 1px 4px;
  border-radius: 4px;
}

/* Printing: keep the notebook only */
@media print {
  .outils, .note, .lien-suite { display: none; }
}
</style>
