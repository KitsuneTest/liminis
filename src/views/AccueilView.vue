<script setup>
import { computed } from 'vue'
import { useProgression, FRESQUES } from '../stores/progression'

const progression = useProgression()
const commence = computed(() => progression.nbTampons > 0)
</script>

<template>
  <section class="couverture">
    <article class="livre">
      <div class="livre__tranche" aria-hidden="true"></div>

      <div class="livre__plat">
        <p class="editeur">Université de la Nouvelle-Calédonie</p>

        <div class="titre-bloc">
          <span class="filet" aria-hidden="true"></span>
          <h1 class="titre">Liminis</h1>
          <p class="sous-titre">Carnet de terrain</p>
          <span class="filet" aria-hidden="true"></span>
        </div>

        <p class="accroche">
          Trois fresques du campus de Nouville,<br />
          à rejoindre, à regarder de près,<br />
          et à garder.
        </p>

        <div class="livre__bas">
          <RouterLink class="bouton bouton--bloc" to="/parcours">
            {{ commence ? 'Reprendre' : 'Ouvrir le carnet' }}
          </RouterLink>
          <p v-if="commence" class="reprise">
            {{ progression.nbTampons }} tampon(s) sur {{ FRESQUES.length }}
          </p>
          <RouterLink v-else class="lien-discret" :to="{ name: 'a-propos' }">À propos</RouterLink>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.couverture {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem
           calc(1rem + env(safe-area-inset-bottom, 0px));
}

.livre {
  display: flex;
  width: 100%;
  max-width: 400px;
  min-height: min(76svh, 620px);
  border-radius: 4px 14px 14px 4px;
  overflow: hidden;
  background: var(--papier-clair);
  box-shadow: var(--ombre-3);
}

.livre__tranche {
  flex: none;
  width: 22px;
  background: linear-gradient(90deg, #cbb495 0%, #ddcbb0 55%, #efe6d6 100%);
  border-right: 1px solid rgba(46, 40, 35, 0.14);
}

.livre__plat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.4rem 1.6rem 1.6rem;
}

.editeur {
  font-size: 0.6rem;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--kraft-fonce);
}

.titre-bloc {
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
}

.filet {
  width: 54px;
  height: 1px;
  background: var(--encre);
  opacity: 0.45;
}

.titre {
  font-size: clamp(2.8rem, 15vw, 3.9rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1;
}

.sous-titre {
  font-size: 0.68rem;
  font-weight: 650;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--encre-douce);
  /* letter-spacing pushes the text right; pull it back to stay centred */
  text-indent: 0.3em;
}

.accroche {
  font-family: var(--serif);
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--encre-douce);
  margin-bottom: auto;
}

.livre__bas {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.reprise { font-size: 0.75rem; color: var(--encre-pale); }

.lien-discret {
  font-size: 0.78rem;
  color: var(--encre-pale);
  text-decoration: none;
}
</style>
