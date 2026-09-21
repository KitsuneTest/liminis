<script setup>
// Scale vision: a playable mock-up until VisionEchelles.vue (GSAP) lands.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'

const route = useRoute()
const progression = useProgression()
const config = computed(() => progression.fresqueConfig(route.params.id))

const ECHELLES = [
  { nom: 'Le mur', taille: '1 m', texte: "La fresque telle qu'on la voit en passant.", teinte: 'var(--terre)' },
  { nom: 'La peau', taille: '1 cm', texte: 'Le grain de la pierre, les couches de peinture.', teinte: 'var(--or)' },
  { nom: 'La colonie', taille: '1 mm', texte: 'Lichens et mousses habitent déjà le pigment.', teinte: 'var(--mousse)' },
  { nom: 'La cellule', taille: '10 µm', texte: 'Le vivant a pris la fresque pour un territoire.', teinte: 'var(--lagon)' },
]

const niveau = ref(0)
const courante = computed(() => ECHELLES[niveau.value])

// Computed here: calc() has no modulo, so the CSS rule was silently dropped.
const GRAINS = Array.from({ length: 14 }, (_, i) => ({
  taille: 8 + ((i * 7) % 11) * 5,
  top: 6 + ((i * 37) % 80),
  left: 6 + ((i * 53) % 80),
  delai: -(i * 0.4).toFixed(1),
}))
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Étape 3 — au plus près</p>
      <h1 class="titre-chapitre">Vision d'échelles</h1>
      <p class="legende sous">{{ config?.nom }} — du visible au microscopique</p>
    </header>

    <div class="hublot" :style="{ '--teinte': courante.teinte }">
      <div class="hublot__fond">
        <span
          v-for="(g, i) in GRAINS"
          :key="i"
          class="grain"
          :style="{
            width: g.taille + 'px',
            height: g.taille + 'px',
            top: g.top + '%',
            left: g.left + '%',
            animationDelay: g.delai + 's',
          }"
        ></span>
      </div>
      <div class="hublot__cadre"></div>
      <p class="hublot__taille">{{ courante.taille }}</p>
    </div>

    <div class="feuille lecture">
      <h2>{{ courante.nom }}</h2>
      <p class="legende">{{ courante.texte }}</p>
    </div>

    <div class="reglage">
      <input
        v-model.number="niveau"
        class="curseur"
        type="range"
        min="0"
        :max="ECHELLES.length - 1"
        step="1"
        aria-label="Niveau de zoom"
      />
      <div class="reglage__crans">
        <button
          v-for="(e, i) in ECHELLES"
          :key="e.nom"
          class="cran"
          :class="{ 'cran--actif': i === niveau }"
          type="button"
          @click="niveau = i"
        >{{ e.taille }}</button>
      </div>
    </div>

    <RouterLink class="retour" :to="`/fresque/${route.params.id}`">← Retour à la fresque</RouterLink>
  </section>
</template>

<style scoped>
.sous { font-family: var(--serif); font-style: italic; font-size: 1rem; margin-top: 0.2rem; }

.hublot {
  position: relative;
  aspect-ratio: 1;
  max-height: 46svh;
  margin: 0 auto;
  width: min(100%, 340px);
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--encre);
  box-shadow: var(--ombre-carte), inset 0 0 40px rgba(59, 47, 36, 0.35);
  background: var(--teinte);
  transition: background 0.6s ease;
}
.hublot__fond { position: absolute; inset: 0; }

.grain {
  position: absolute;
  border-radius: 50%;
  background: rgba(253, 248, 236, 0.55);
  animation: derive 9s ease-in-out infinite alternate;
}
@keyframes derive {
  from { transform: translate(0, 0) scale(0.9); opacity: 0.35; }
  to   { transform: translate(14px, -12px) scale(1.15); opacity: 0.8; }
}

.hublot__cadre {
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  border: 2px dashed rgba(253, 248, 236, 0.6);
  pointer-events: none;
}
.hublot__taille {
  position: absolute;
  bottom: 14%;
  left: 50%;
  transform: translateX(-50%);
  font: 700 0.75rem/1 var(--sans);
  letter-spacing: 0.1em;
  color: var(--encre);
  background: var(--papier-clair);
  border: 2px solid var(--encre);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
}

.lecture { text-align: center; }

.reglage { display: flex; flex-direction: column; gap: 0.5rem; }

.curseur {
  width: 100%;
  accent-color: var(--terre);
}

.reglage__crans { display: flex; justify-content: space-between; gap: 0.3rem; }
.cran {
  flex: 1;
  font: 700 0.68rem/1 var(--sans);
  padding: 0.45rem 0.2rem;
  border-radius: var(--rayon-s);
  border: 1.5px solid var(--kraft);
  background: var(--papier-clair);
  color: var(--encre-pale);
  cursor: pointer;
}
.cran--actif {
  color: var(--papier-clair);
  background: var(--encre);
  border-color: var(--encre);
}

.retour {
  align-self: center;
  font-size: 0.85rem;
  color: var(--encre-douce);
  text-decoration: none;
  border-bottom: 1px dashed var(--kraft);
}
</style>
