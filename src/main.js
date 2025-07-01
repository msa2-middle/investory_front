import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/api'
import 'bootstrap/dist/css/bootstrap.min.css'

async function bootstrap(){

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
} else if (localStorage.getItem('refreshToken')) {
  await tryRefreshToken(authStore, router)
}

app.mount('#app')

}

bootstrap()

async function tryRefreshToken(authStore, router) {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    console.log('리프레시 토큰 없음. 새로 로그인 필요.')
    router.push('/login')
    return
  }

  try {
    const res = await api.post('/users/refresh', { refreshToken })
    const newAccessToken = res.data.accessToken
    const userName = res.data.name

    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('userName', userName)

    authStore.setToken(newAccessToken)
    authStore.setUserName(userName)

    console.log('accessToken 재발급 성공!')
  } catch (e) {
    console.error('refreshToken 만료 혹은 재발급 실패', e)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userName')
    router.push('/login')
  }
}
