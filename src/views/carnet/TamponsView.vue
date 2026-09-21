<script setup>
import { useProgression, FRESQUES } from '../../stores/progression'

const progression = useProgression()
</script>

<template>
  <section>
    <header class="entete">
      <h1>Mes tampons</h1>
      <p class="devise">Plus on regarde petit, moins les choses sont séparées</p>
    </header>

    <hr class="separateur" />

    <ul class="liste">
      <li v-for="(f, i) in FRESQUES" :key="f.id">
        <RouterLink
          class="carte"
          :class="{ 'carte--inverse': i % 2 === 1, 'carte--obtenu': progression.fresques[f.id].tampon }"
          :style="{ '--teinte': `var(--${f.couleur})` }"
          :to="{ name: 'tampon-detail', params: { id: f.id } }"
        >
          <span class="carte__fond" :style="{ backgroundImage: `url(${f.photo})` }"></span>

          <span class="carte__jeton">
            <img
              class="carte__photo"
              :src="f.photo"
              :style="{ objectPosition: f.cadrage }"
              :alt="`Fresque ${f.nom}`"
              loading="lazy"
              decoding="async"
            />
            <span v-if="progression.fresques[f.id].tampon" class="carte__coche">✓</span>
          </span>

          <span class="carte__texte">
            <span class="carte__nom">{{ f.nom }}</span>
            <span class="carte__sous">{{ f.sousTitre }}</span>
            <span class="carte__lieu">{{ f.lieu }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>

    <p class="bilan">
      {{ progression.nbTampons }} tampon(s) sur {{ FRESQUES.length }}
    </p>
  </section>
</template>

<style scoped>
.entete { display: flex; flex-direction: column; gap: 0.3rem; }
.devise {
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--encre-douce);
  max-width: 28ch;
}

.liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.carte {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  border-radius: var(--rayon);
  overflow: hidden;
  text-decoration: none;
  color: var(--papier-clair);
  background: var(--teinte);
  box-shadow: var(--ombre-2);
  transition: transform 0.25s var(--ressort), box-shadow 0.25s var(--doux);
}
.carte:active { transform: scale(0.98); box-shadow: var(--ombre-1); }
.carte--inverse { flex-direction: row-reverse; text-align: right; }

/* The mural itself, pushed far back so the text stays readable. */
.carte__fond {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.22;
  filter: saturate(1.3);
}

.carte__jeton {
  position: relative;
  flex: none;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: var(--ombre-2);
}
.carte__photo { width: 100%; height: 100%; object-fit: cover; display: block; }

.carte__coche {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  background: color-mix(in srgb, var(--teinte) 72%, transparent);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

.carte__texte {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.carte__nom {
  font-family: var(--serif);
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.1;
}
.carte__sous {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.92;
}
.carte__lieu {
  margin-top: 4px;
  font-size: 0.7rem;
  opacity: 0.75;
}

/* Unvisited murals keep their colour but stay slightly withdrawn. */
.carte:not(.carte--obtenu) { box-shadow: var(--ombre-1); }
.carte:not(.carte--obtenu) .carte__fond { opacity: 0.14; }
.carte:not(.carte--obtenu) .carte__photo { filter: grayscale(0.7); }
.carte:not(.carte--obtenu) .carte__jeton { border-color: rgba(255, 255, 255, 0.5); }
.carte--obtenu { box-shadow: var(--ombre-2); }

.bilan {
  margin-top: 1.1rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--encre-pale);
}
</style>
