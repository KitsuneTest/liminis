<script setup>
import { useRouter } from 'vue-router'
import { useProgression } from '../../stores/progression'

const progression = useProgression()
const router = useRouter()

async function reinitialiser() {
  if (!confirm('Effacer tous les tampons, fragments et le familier de cet appareil ?')) return
  await progression.reinitialiser()
  router.push({ name: 'tampons' })
}
</script>

<template>
  <section class="pile">
    <header>
      <h1>À propos</h1>
      <hr class="filet" />
    </header>

    <div class="feuille feuille--cousue">
      <p>
        <b>Liminis</b> est un parcours de trois fresques à explorer sur place :
        la carte vous y mène, la caméra en révèle les fragments, le carnet garde
        la trace.
      </p>
    </div>

    <div class="feuille feuille--teintee">
      <p class="surtitre">Autorisations utilisées</p>
      <ul class="liste">
        <li><b>Position</b> — poser le tampon quand vous entrez dans une zone.</li>
        <li><b>Caméra</b> — reconnaître la fresque et en révéler les fragments.</li>
      </ul>
      <p class="legende">
        Les deux exigent une connexion <code>https://</code>. Aucun compte, aucune
        installation, aucun serveur : rien n'est envoyé ailleurs, la progression
        reste sur votre appareil et le parcours fonctionne hors-ligne une fois la
        page chargée.
      </p>
    </div>

    <div class="feuille">
      <p class="surtitre">Recommencer</p>
      <p class="legende">
        Efface la progression de cet appareil : tampons, fragments, échelles et familier.
      </p>
      <button class="bouton bouton--secondaire bouton--bloc" type="button" @click="reinitialiser">
        Réinitialiser le parcours
      </button>
    </div>
  </section>
</template>

<style scoped>
.liste {
  margin: 0.4rem 0 0.7rem;
  padding-left: 1.1rem;
  font-size: 0.9rem;
  color: var(--encre-douce);
}
.liste li { margin-bottom: 0.25rem; }
.liste b { color: var(--encre); }

code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.82em;
  background: var(--papier-ombre);
  padding: 1px 4px;
  border-radius: 4px;
}
</style>
