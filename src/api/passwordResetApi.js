import api from './api'

const passwordResetApi = {
  sendCode: (data) => api.post('/users/password-reset/send-code', data),
  verifyCode: (data) => api.post('/users/password-reset/verify-code', data),
  resetPassword: (data) => api.post('/users/password-reset/reset', data),
}

export default passwordResetApi
