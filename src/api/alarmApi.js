import api from './api'

// 전체 Alarm API
const alarmApi = {
  getAlarms: (data) => api.get('/alarm/storage', data),
  readAll: (data) => api.put('/alarm/read-all', {}, data), // 빈 객체 추가
  readOne: (alarmId, data) => api.put(`/alarm/read-one/${alarmId}`, {}, data), // URL에 alarmId 포함

  // 주가 알람 설정 생성
  createStockAlertSettings: ({ stockId, targetPrice, condition }) =>
    api.post(
      `/stock-alert-setting/stocks/${stockId}`,
      {
        targetPrice,      // 예: 60000
        condition         // 'ABOVE' | 'BELOW'
      }
    ),

  // 특정 유저의 특정 주식 알림 설정 조회
  getUserStockSettings: (stockId) => api.get(`/stock-alert-setting/stocks/${stockId}`),

  // 주식 알림 설정 수정 - 수정된 부분
  updateStockAlertSettings: (stockId, data) =>
    api.put(`/stock-alert-setting/stocks/${stockId}`, data),

  // 주식 알림 설정 삭제
  deleteStockAlertSettings: (stockId) => api.delete(`/stock-alert-setting/stocks/${stockId}`),

  // 사용자의 모든 주식 알림 설정 조회 (선택사항)
  getAllUserStockSettings: () => api.get(`/stock-alert-setting/`),
}

export default alarmApi
