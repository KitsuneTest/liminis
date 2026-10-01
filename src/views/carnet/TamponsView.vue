<script setup>
import { useProgression, FRESQUES } from '../../stores/progression'

const progression = useProgression()
</script>

<template>
  <section>
    <h1>Mes tampons</h1>
    <p class="devise">Plus on regarde petit, moins les choses sont séparées</p>
    <hr class="filet" />

    <ul class="liste">
      <li v-for="(f, i) in FRESQUES" :key="f.id">
        <RouterLink
          class="carte"
          :class="{ 'carte--inverse': i % 2 === 1, 'carte--obtenu': progression.fresques[f.id].tampon }"
          :style="{ '--teinte': `var(--${f.couleur})` }"
          :to="{ name: 'tampon-detail', params: { id: f.id } }"
        >
          <img
            class="carte__photo"
            :src="f.photo"
            :style="{ objectPosition: f.cadrage }"
            :alt="`Fresque ${f.nom}`"
            loading="lazy"
            decoding="async"
          />
          <span class="carte__texte">
            <span class="carte__nom">{{ f.nom }}</span>
            <span class="carte__sous">{{ f.sousTitre }}</span>
            <span class="carte__lieu">{{ f.lieu }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.devise {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--encre);
}

.liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.carte {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 86px;
  padding: 0.5rem 0.9rem 0.5rem 0.4rem;
  border-radius: 4px;
  text-decoration: none;
  color: var(--papier-clair);
  background: var(--kraft-fonce);
  box-shadow: 3px 3px 0 color-mix(in srgb, var(--kraft-fonce) 70%, var(--encre));
  transition: transform 0.2s var(--ressort);
}
.carte:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--kraft-fonce); }
.carte--inverse { flex-direction: row-reverse; text-align: right; padding: 0.5rem 0.4rem 0.5rem 0.9rem; }

.carte__photo {
  flex: none;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--papier);
  filter: grayscale(0.7);
}

.carte__texte { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.carte__nom { font: 400 1.05rem/1.1 var(--titre); letter-spacing: 0.02em; }
.carte__sous {
  font: 700 0.58rem/1.35 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.carte__lieu {
  margin-top: 0.45rem;
  font: 400 0.55rem/1.2 var(--mono);
  letter-spacing: 0.04em;
  text-transform: lowercase;
  opacity: 0.8;
}

.carte--obtenu { background: var(--teinte); box-shadow: 3px 3px 0 color-mix(in srgb, var(--teinte) 60%, var(--encre)); }
.carte--obtenu .carte__photo { filter: none; }
</style>
