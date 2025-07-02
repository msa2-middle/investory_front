import api from './api'

const adminApi = {
  // ==== USERS ====
  getAllUsers: () => api.get('/api/admin/users'),

  getUserById: (userId) => api.get(`/api/admin/users/${userId}`),

  updateUser: (userId, data) =>
    api.patch(`/api/admin/users/${userId}`, data),

  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),

  // ==== POSTS ====
  getAllPosts: () => api.get('/api/admin/posts'),

  getPostById: (postId) => api.get(`/api/admin/posts/${postId}`),

  updatePost: (postId, data) =>
    api.patch(`/api/admin/posts/${postId}`, data),

  deletePost: (postId) => api.delete(`/api/admin/posts/${postId}`),

  // ==== COMMENTS ====
  getAllComments: () => api.get('/api/admin/comments'),

  getCommentById: (commentId) =>
    api.get(`/api/admin/comments/${commentId}`),

  updateComment: (commentId, data) =>
    api.patch(`/api/admin/comments/${commentId}`, data),

  deleteComment: (commentId) =>
    api.delete(`/api/admin/comments/${commentId}`),
}

export default adminApi
