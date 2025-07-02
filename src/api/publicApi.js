import axios from 'axios'

const publicApi = axios.create({
  baseURL: '/api', // 프록시를 통해 백엔드로 전달
  headers: {
    'Content-Type': 'application/json',
  },
})

export default publicApi
