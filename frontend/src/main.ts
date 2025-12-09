import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Ensure a default club selection for demo data
if (!localStorage.getItem('clubId')) {
  localStorage.setItem('clubId', '1')
}

const app = createApp(App)
app.use(router)
app.mount('#app')
