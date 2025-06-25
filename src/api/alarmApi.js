import api from './api'

// 전체 Alarm API
const alarmApi = {
  getAlarms: (data) => api.get('/alarm/storage', data),
  readAll: (data) => api.get('/alarm/read-all', data),
  readOne: (data) => api.get('/alarm/read-one', data),
  createStockAlertSettings: ({ stockId, targetPrice, condition }) =>
    api.post(
      // `/stock-alert-setting/stocks/${encodeURIComponent(stockId)}`, ==> 혹시 모를 특수문자,공백,한글 방지용 안전벨트
      `/stock-alert-setting/stocks/${stockId}`,
      {
        targetPrice,      // 예: 60000
        condition         // 'ABOVE' | 'BELOW'
      }
    )
}

export default alarmApi
