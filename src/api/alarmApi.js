import api from './api'

// 전체 Alarm API
const alarmApi = {
  getAlarms: (data) => api.get('/alarm/storage', data),
  readAll: (data) => api.put('/alarm/read-all', {}, data), // 빈 객체 추가
  readOne: (alarmId, data) => api.put(`/alarm/read-one/${alarmId}`, {}, data), // URL에 alarmId 포함
  createStockAlertSettings: ({ stockId, targetPrice, condition }) =>
    api.post(
      `/stock-alert-setting/stocks/${stockId}`,
      {
        targetPrice,      // 예: 60000
        condition         // 'ABOVE' | 'BELOW'
      }
    )
}

export default alarmApi
