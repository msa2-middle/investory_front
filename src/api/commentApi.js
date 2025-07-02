// commentApi.js
import axios from 'axios'
import publicApi from '@/api/publicApi.js'
import api from '@/api/api.js'

const commentApi = {
  // 댓글 생성
  createComment: (postId, content) => api.post(`/post/${postId}/comments/`, content),

  // 특정 게시글의 댓글 전체 조회
  getCommentsByPost: (postId) => api.get(`/post/${postId}/comments/`),

  // 댓글 상세 조회
  getComment: (postId, commentId) => api.get(`/post/${postId}/comments/${commentId}`),

  // 댓글 수정
  updateComment: (postId, commentId, content) =>
    api.put(`/post/${postId}/comments/${commentId}`, content),

  // 댓글 삭제
  deleteComment: (postId, commentId) => api.delete(`/post/${postId}/comments/${commentId}`),

  // 댓글 좋아요 토글
  likeComment: (postId, commentId) => api.post(`/comments/${commentId}/like`),

  // 댓글 좋아요 상태 확인
  checkCommentLikeStatus: (commentId) => api.get(`/comments/${commentId}/like/status`),

  // 댓글 좋아요 수 조회
  getCommentLikeCount: (commentId) => api.get(`/comments/${commentId}/like/count`),


}

export default commentApi
