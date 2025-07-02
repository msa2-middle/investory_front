import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api', // 프록시를 통해 백엔드로 전달
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - accessToken 자동 포함
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터 - 401이면 refreshToken으로 재발급 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // accessToken 만료로 401 발생했을 때
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token saved.')
        }

        // refreshToken으로 accessToken 재발급 요청 (절대 경로 사용)
        const res = await axios.post('/api/users/refresh', { refreshToken })
        const newAccessToken = res.data.accessToken

        const authStore = useAuthStore()
        authStore.setToken(newAccessToken)

        // 새 accessToken 저장
        localStorage.setItem('accessToken', newAccessToken)

        // 기존 요청 Authorization 헤더 교체
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('리프레시 토큰 만료', refreshError)

        // refreshToken 만료되면 로그아웃 처리
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
