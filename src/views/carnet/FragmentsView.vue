<script setup>
import { computed, ref } from 'vue'
import { useProgression, FRESQUES } from '../../stores/progression'
import Icone from '../../components/Icone.vue'

const progression = useProgression()
const ouvert = ref(null)

// Reference photos are 4:3 and the cards 3:4, hence the two zoom factors.
function recadrage({ cible }, { u, v }, zoom) {
  const px = cible.x + u * cible.w
  const py = cible.y + v * cible.h
  const kx = zoom
  const ky = (zoom * 0.75 * 3) / 4
  const borne = (t) => Math.min(100, Math.max(0, t * 100))
  return {
    backgroundSize: `${zoom * 100}% auto`,
    backgroundPosition: `${borne((0.5 - kx * px) / (1 - kx))}% ${borne((0.5 - ky * py) / (1 - ky))}%`,
  }
}

const cases = computed(() =>
  FRESQUES.flatMap((f) =>
    f.ancrages.slice(0, f.nbFragments).map((a, i) => ({
      id: `${f.id}-${i}`,
      fresque: f,
      numero: i + 1,
      obtenu: progression.fresques[f.id].fragments.includes(`frag-${i + 1}`),
      style: { backgroundImage: `url(${f.photo})`, ...recadrage(f, a, 4) },
      grand: { backgroundImage: `url(${f.photo})`, ...recadrage(f, a, 2.6) },
    }))
  )
)
</script>

<template>
  <section>
    <h1>Fragments</h1>
    <hr class="filet" />

    <ul class="grille">
      <li v-for="c in cases" :key="c.id">
        <button
          v-if="c.obtenu"
          class="case"
          type="button"
          :style="{ ...c.style, '--teinte': `var(--${c.fresque.couleur})` }"
          :aria-label="`Fragment ${c.numero} — ${c.fresque.nom}`"
          @click="ouvert = c"
        ></button>
        <span v-else class="case case--vide" aria-label="Fragment à trouver">
          <Icone nom="cadenas" :taille="16" />
        </span>
      </li>
    </ul>

    <Teleport to="body">
      <Transition name="voile">
        <div v-if="ouvert" class="voile" @click.self="ouvert = null">
          <div class="fiche" role="dialog" :aria-label="`Fragment ${ouvert.numero}`">
            <div class="fiche__image" :style="ouvert.grand"></div>
            <p class="fiche__sur" :style="{ color: `var(--${ouvert.fresque.couleur})` }">
              Fragment {{ ouvert.numero }} / {{ ouvert.fresque.nbFragments }}
            </p>
            <h2>{{ ouvert.fresque.nom }}</h2>
            <p class="fiche__sous">{{ ouvert.fresque.sousTitre }}</p>
            <RouterLink
              class="bouton bouton--accent bouton--bloc fiche__echelle"
              :to="{
                name: 'microscopique',
                params: { id: ouvert.fresque.id },
                query: { niveau: ouvert.numero, depuis: 'carnet' },
              }"
              @click="ouvert = null"
            >
              Voir l'échelle débloquée
            </RouterLink>
            <button class="fiche__fermer" type="button" @click="ouvert = null">fermer</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.grille {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem 1.2rem;
}

.case {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 3 / 4;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background-color: var(--kraft);
  background-repeat: no-repeat;
  box-shadow: inset 0 0 0 2px var(--teinte);
  cursor: pointer;
}
.case--vide {
  color: var(--encre-pale);
  box-shadow: none;
  cursor: default;
}

.voile {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 2rem 1.6rem;
  background: color-mix(in srgb, var(--encre) 45%, transparent);
}

.fiche {
  width: min(100%, 340px);
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1rem 1.2rem;
  border-radius: 8px;
  background: var(--papier-clair);
}
.fiche__image {
  aspect-ratio: 3 / 4;
  border-radius: 4px;
  background-color: var(--kraft);
  background-repeat: no-repeat;
  margin-bottom: 0.6rem;
}
.fiche__sur {
  font: 700 0.62rem/1 var(--mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.fiche__sous { font: 400 0.62rem/1.4 var(--mono); color: var(--encre-pale); text-transform: uppercase; }
.fiche__echelle { margin-top: 0.8rem; }
.fiche__fermer {
  align-self: center;
  margin-top: 0.8rem;
  padding: 0.3rem 0.8rem;
  border: 0;
  background: none;
  font: 400 0.68rem/1 var(--mono);
  color: var(--encre-pale);
  cursor: pointer;
}

.voile-enter-active,
.voile-leave-active { transition: opacity 0.2s ease; }
.voile-enter-from,
.voile-leave-to { opacity: 0; }
</style>
