import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8091',  // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
