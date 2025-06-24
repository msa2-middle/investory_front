import api from './api'

// 전체 User API
const userApi = {
  signup: (data) => api.post('/users/signup', data),
  login: (data) => api.post('/users/login', data),
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
