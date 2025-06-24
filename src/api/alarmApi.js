import api from './api'

// 전체 Alarm API
const alarmApi = {
  getAlarms: (data) => api.get('/alarm/storage', data),
  readAll: (data) => api.get('/alarm/read-all', data),
  readOne: (data) => api.get('/alarm/read-one', data),
}

export default alarmApi
