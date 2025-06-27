import api from './api'
import publicApi from './publicApi'

// 전체 User API
const userApi = {
  // 🔓 비인증: publicApi 사용
  signup: (data) => publicApi.post('/users/signup', data),
  login: (data) => publicApi.post('/users/login', data),

  // 🔐 인증 필요: api 사용
  getMyPage: () => api.get('/users/me'),
  updateMyInfo: (updateData) => api.patch('/users/me', updateData),
  updatePassword: (passwordData) => api.patch('/users/password', passwordData),
  withdraw: () => api.delete('/users/me'),
  getMyPosts: () => api.get('/users/me/posts'),
  getMyLikedPosts: () => api.get('/users/me/likes'),
  getMyComments: () => api.get('/users/me/comments'),
  getMyLikedComments: () => api.get('/users/me/liked-comments'),
}

export default userApi
