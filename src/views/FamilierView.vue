<script setup>
// Personality quiz, then the companion reveal, wired to the store.
import { computed, ref } from 'vue'
import { useProgression } from '../stores/progression'

const progression = useProgression()

const QUESTIONS = [
  {
    texte: 'Devant un mur peint, vous commencez par…',
    choix: [
      { libelle: 'reculer pour tout embrasser', affinite: 'brume' },
      { libelle: 'coller le nez au détail', affinite: 'lichen' },
      { libelle: 'chercher qui l’a fait', affinite: 'corbeau' },
    ],
  },
  {
    texte: 'Votre heure de marche préférée ?',
    choix: [
      { libelle: "l'aube, quand tout est encore gris", affinite: 'brume' },
      { libelle: 'midi, à l’ombre des murs', affinite: 'lichen' },
      { libelle: 'le crépuscule', affinite: 'corbeau' },
    ],
  },
  {
    texte: "Ce que vous rapportez d'une balade…",
    choix: [
      { libelle: 'une odeur, une impression', affinite: 'brume' },
      { libelle: 'un caillou, une feuille', affinite: 'lichen' },
      { libelle: 'une histoire à raconter', affinite: 'corbeau' },
    ],
  },
]

const FAMILIERS = {
  brume: {
    id: 'brume',
    nom: 'Brume, la veilleuse',
    trait: 'Elle marche devant vous et ne se retourne jamais.',
    teinte: 'var(--lagon)',
    glyphe: '☁',
  },
  lichen: {
    id: 'lichen',
    nom: 'Lichen, le patient',
    trait: "Il pousse d'un millimètre par an et s'en accommode très bien.",
    teinte: 'var(--mousse)',
    glyphe: '❀',
  },
  corbeau: {
    id: 'corbeau',
    nom: 'Corbeau, le collectionneur',
    trait: 'Il garde en mémoire chaque mur que vous avez regardé.',
    teinte: 'var(--prune)',
    glyphe: '❖',
  },
}

const index = ref(0)
const reponses = ref([])

const question = computed(() => QUESTIONS[index.value])
const familier = computed(() =>
  progression.familier ? FAMILIERS[progression.familier.id] : null
)

function repondre(choix) {
  reponses.value.push(choix.affinite)

  if (index.value < QUESTIONS.length - 1) {
    index.value += 1
    return
  }

  // Most frequent affinity; first one wins a tie.
  const comptes = reponses.value.reduce((acc, a) => ({ ...acc, [a]: (acc[a] ?? 0) + 1 }), {})
  const gagnant = Object.entries(comptes).sort((a, b) => b[1] - a[1])[0][0]

  progression.repondreQuiz(reponses.value)
  progression.debloquerFamilier({ id: gagnant, nom: FAMILIERS[gagnant].nom })
}

function recommencer() {
  index.value = 0
  reponses.value = []
  progression.familier = null
  progression.quiz = { termine: false, reponses: [] }
}
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Étape 4 — la rencontre</p>
      <h1 class="titre-chapitre">Votre familier</h1>
    </header>

    <!-- Reveal -->
    <template v-if="familier">
      <div class="feuille feuille--cousue revelation" :style="{ '--teinte': familier.teinte }">
        <div class="creature">
          <span class="creature__corps"></span>
          <span class="creature__glyphe">{{ familier.glyphe }}</span>
          <span class="creature__ombre"></span>
        </div>
        <h2>{{ familier.nom }}</h2>
        <p class="legende">{{ familier.trait }}</p>
      </div>

      <div class="outils">
        <RouterLink class="bouton bouton--petit" to="/carnet">Voir le carnet</RouterLink>
        <button class="bouton bouton--petit bouton--secondaire" type="button" @click="recommencer">
          Refaire le questionnaire
        </button>
      </div>
    </template>

    <!-- Questionnaire -->
    <template v-else>
      <div class="feuille questionnaire">
        <p class="surtitre">Question {{ index + 1 }} / {{ QUESTIONS.length }}</p>
        <div class="jauge jauge--fine">
          <div class="jauge__valeur" :style="{ width: ((index + 1) / QUESTIONS.length) * 100 + '%' }"></div>
        </div>

        <h2 class="question">{{ question.texte }}</h2>

        <div class="choix">
          <button
            v-for="c in question.choix"
            :key="c.libelle"
            class="choix__item"
            type="button"
            @click="repondre(c)"
          >{{ c.libelle }}</button>
        </div>
      </div>

      <p class="legende note">
        Trois questions, aucune mauvaise réponse. Le familier se choisit selon
        votre façon de regarder.
      </p>
    </template>
  </section>
</template>

<style scoped>
/* --- Reveal ---------------------------------------------------------------- */
.revelation {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding-top: 1.6rem;
}

.creature {
  position: relative;
  width: 140px;
  height: 140px;
  display: grid;
  place-items: center;
  animation: flotte 4s ease-in-out infinite;
}
.creature__corps {
  position: absolute;
  inset: 8px;
  border-radius: 52% 48% 46% 54% / 58% 56% 44% 42%;
  background: var(--teinte);
  box-shadow: inset -10px -14px 26px rgba(0, 0, 0, 0.18);
}
.creature__glyphe {
  position: relative;
  font-size: 2.6rem;
  color: var(--papier-clair);
}
.creature__ombre {
  position: absolute;
  bottom: -6px;
  width: 78px;
  height: 12px;
  border-radius: 50%;
  background: rgba(59, 47, 36, 0.18);
  filter: blur(2px);
}
@keyframes flotte {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-9px); }
}

/* --- Questionnaire --------------------------------------------------------- */
.questionnaire { display: flex; flex-direction: column; gap: 0.75rem; }
.jauge--fine { height: 7px; }
.question { font-size: 1.15rem; margin-top: 0.3rem; }

.choix { display: flex; flex-direction: column; gap: 0.5rem; }
.choix__item {
  text-align: left;
  font: 500 0.92rem/1.35 var(--sans);
  color: var(--encre);
  background: var(--papier);
  border: 1px solid var(--ligne-forte);
  border-radius: var(--rayon-s);
  padding: 0.8rem 0.95rem;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.12s ease;
}
.choix__item:hover { border-color: var(--kraft-fonce); }
.choix__item:active { transform: translateY(2px); }

.outils { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
.note { text-align: center; }
</style>
