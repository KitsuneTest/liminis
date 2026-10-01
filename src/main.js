import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useProgression } from './stores/progression'
import '@fontsource/darumadrop-one/latin-400.css'
import '@fontsource/darumadrop-one/latin-ext-400.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@fontsource/karla/400.css'
import '@fontsource/karla/500.css'
import '@fontsource/karla/600.css'
import '@fontsource/karla/700.css'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Mount no matter what: a storage failure must not leave a blank screen.
const progression = useProgression()
progression
  .pret()
  .catch((e) => console.error('Hydratation impossible :', e))
  .finally(() => app.mount('#app'))
