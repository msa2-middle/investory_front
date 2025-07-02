import axios from 'axios'
import router from '@/router'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 필요 시
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 404) {
      router.push('/error/404')
    } else if (status === 500) {
      router.push('/error/500')
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
