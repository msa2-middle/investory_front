import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
const token = localStorage.getItem('accessToken')
const userName = localStorage.getItem('userName')

if (token) {
  authStore.setToken(token)
  authStore.setUserName(userName)
}

app.mount('#app')

