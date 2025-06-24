import axios from 'axios'

const publicApi = axios.create({
  baseURL: 'http://localhost:8091',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default publicApi
