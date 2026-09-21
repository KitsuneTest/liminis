# Liminis — PWA

Dispositif interactif : l'utilisateur scanne un QR code, suit une carte jusqu'à
3 fresques, les explore en réalité augmentée pour collecter des fragments, et
complète un carnet exportable en PDF. Fonctionne **hors-ligne** après le premier
chargement, **sans compte ni application à installer**.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes : `npm run build` (production), `npm run preview` (tester le build + le mode hors-ligne).

> Le service worker n'est actif qu'en build (`npm run build && npm run preview`), pas en `dev`.

## Tester sur téléphone

La caméra et le GPS exigent **HTTPS** (ou `localhost`). Pour tester sur mobile :

```bash
npm run dev -- --host     # puis ouvrir l'URL réseau depuis le téléphone
```

Si le navigateur bloque la caméra, déployer sur Netlify (HTTPS automatique) et tester depuis l'URL en ligne.

## Architecture

**Le store `src/stores/progression.js` est le hub central.** Toutes les pages
lisent et écrivent dedans ; aucune page ne parle directement à une autre.
Le store se sauvegarde tout seul dans IndexedDB (la progression survit au reload).

```
src/
├── main.js                 point d'entrée (hydrate le store avant d'afficher)
├── router/index.js         routes + verrouillage des pages selon la progression
├── stores/progression.js   ★ hub central (tampons, fragments, quiz, familier)
├── data/fresques.js        ⚠️ config des 3 fresques — À REMPLIR
├── composables/
│   └── useGeoloc.js        suivi GPS → validation de zone
├── components/             (à créer : Carte, SceneAR, VisionEchelles, Quiz…)
└── views/                  une vue par page
```

## Répartition du travail

Le socle et le store sont déjà en place : chacun peut prendre une brique sans
bloquer les autres. Les emplacements sont marqués `TODO` dans le code.

| Brique | Fichier à créer | Techno | Point d'entrée dans le store |
|---|---|---|---|
| Carte & parcours | `components/Carte.vue` | Leaflet + leaflet.offline | `verifierZone()` (déjà câblé) |
| Réalité augmentée | `components/SceneAR.vue` | MindAR + A-Frame | `collecterFragment(id, frag)` |
| Vision d'échelles | `components/VisionEchelles.vue` | GSAP | `microscopiqueDebloquee(id)` |
| Carnet & export PDF | `components/CarnetImprimable.vue` | html2canvas + jsPDF | lecture de `fresques`, `resume` |
| Quiz & familier | `components/Quiz.vue` | Vue | `repondreQuiz()`, `debloquerFamilier()` |

À installer au moment d'attaquer sa brique :

```bash
npm install mind-ar aframe        # AR
npm install gsap                  # vision d'échelles
npm install html2canvas jspdf     # export PDF
npm install leaflet.offline       # tuiles hors-ligne
```

## À faire en priorité

1. Relever les **coordonnées GPS réelles** des 3 fresques → `src/data/fresques.js`
2. Ajouter les **icônes PWA** (192 et 512 px) dans `public/icons/`
3. Compiler les **cibles AR** (`.mind`) depuis les photos des fresques → `public/ar/`
4. **Tester l'AR sur la vraie fresque** (lumière, angle) — c'est le principal risque du projet

## Conventions d'équipe

- Une branche par brique : `feat/carte`, `feat/ar`, `feat/vision`…
- Ne jamais modifier `stores/progression.js` sans prévenir (tout le monde en dépend).
- Commiter le `package-lock.json` (versions figées = mêmes versions pour tous).
