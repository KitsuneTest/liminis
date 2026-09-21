import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useProgression } from './stores/progression'
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
