import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8091', // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
})

// 인터셉터 추가 (토큰 자동 포함)
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
  }
)

export default api
