import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useProgression } from './stores/progression'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// On charge la progression sauvegardée AVANT d'afficher l'app,
// pour que le rechargement de page ne perde rien.
const progression = useProgression()
progression.hydrater().then(() => app.mount('#app'))
