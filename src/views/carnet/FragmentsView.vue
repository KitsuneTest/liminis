<script setup>
import { computed } from 'vue'
import { useProgression, FRESQUES } from '../../stores/progression'

const progression = useProgression()

const total = computed(() =>
  FRESQUES.reduce((n, f) => n + progression.fresques[f.id].fragments.length, 0)
)
const totalPossible = computed(() => FRESQUES.reduce((n, f) => n + f.nbFragments, 0))
</script>

<template>
  <section>
    <header class="entete">
      <h1>Mes fragments</h1>
      <p class="devise">Chaque mur en cache trois. Ils ne se montrent pas tout seuls.</p>
    </header>

    <div class="jauge">
      <div class="jauge__valeur" :style="{ width: (total / totalPossible) * 100 + '%' }"></div>
    </div>
    <p class="compte">{{ total }} sur {{ totalPossible }}</p>

    <hr class="separateur" />

    <div v-for="f in FRESQUES" :key="f.id" class="groupe" :style="{ '--teinte': `var(--${f.couleur})` }">
      <div class="groupe__titre">
        <h2>{{ f.nom }}</h2>
        <RouterLink class="lien" :to="{ name: 'tampon-detail', params: { id: f.id } }">
          Voir →
        </RouterLink>
      </div>

      <ul class="jetons">
        <li v-for="n in f.nbFragments" :key="n">
          <span
            class="jeton"
            :class="{ 'jeton--vide': !progression.fresques[f.id].fragments.includes(`frag-${n}`) }"
          >
            <span v-if="!progression.fresques[f.id].fragments.includes(`frag-${n}`)" aria-hidden="true">🔒</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.entete { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.devise { font-size: 0.82rem; line-height: 1.45; color: var(--encre-douce); max-width: 32ch; }

.compte { margin-top: 0.4rem; font-size: 0.78rem; color: var(--encre-pale); text-align: right; }

.groupe { margin-bottom: 1.4rem; }
.groupe__titre {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
}
.groupe__titre h2 { font-size: 1.05rem; }

.lien {
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--teinte);
  text-decoration: none;
}

.jetons { list-style: none; margin: 0.6rem 0 0; padding: 0; display: flex; gap: 0.7rem; }
.jeton {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--teinte);
  box-shadow: var(--ombre-1);
  font-size: 0.85rem;
}
.jeton--vide {
  background: transparent;
  border: 1.5px dashed var(--kraft-fonce);
  box-shadow: none;
  opacity: 0.6;
}
</style>
