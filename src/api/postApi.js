import publicApi from './publicApi'
import api from './api'

const postApi = {


  // 1. 특정 종목의 모든 게시글 조회
  getPostsByStock: (stockId) => publicApi.get(`/stock/${stockId}/community`),

  // 2. 게시글 작성
  createPost: (stockId, post) => api.post(`/stock/${stockId}/community`, post),

  // 3 .게시글 상세 조회
  getPost: (postId) => publicApi.get(`/community/posts/${postId}`),

  // 4. 게시글 수정
  updatePost: (postId, post) => api.patch(`/community/posts/${postId}`, post),

  // 5. 게시글 삭제
  deletePost: (postId) => api.delete(`/community/posts/${postId}`),

  // 6. 게시글 좋아요
  likePost: (postId) => api.post(`/posts/${postId}/likes`),

  // 7. 게시글 좋아요 취소
  unlikePost: (postId) => api.delete(`/posts/${postId}/likes`),

  // 8. 특정 유저가 해당 게시글에 좋아요를 눌렀는지 확인
  hasUserLiked: (postId) => api.get(`/posts/${postId}/likes/check`),

  // 9. postId로 작성자 이름 찾기
  getPostAuthorByPostId: (postId) => api.get(`/community/posts/author/${postId}`),

  // 10. 게시글 좋아요 개수 가져오기
  getPostLikeCount: (postId) => api.get(`/community/posts/likes/${postId}`),

}

export default postApi
