import publicApi from './publicApi'

const postApi = {


  // 1. 특정 종목의 모든 게시글 조회
  getPostsByStock: (stockId) => publicApi.get(`/stock/${stockId}/community`),

  // 2. 게시글 작성
  createPost: (stockId, post) => publicApi.post(`/stock/${stockId}/community`, post),

  // 3 .게시글 상세 조회
  getPost: (postId) => publicApi.get(`/community/posts/${postId}`),

  // 4. 게시글 수정
  updatePost: (postId, post) => publicApi.put(`/community/posts/${postId}`, post),

  // 5. 게시글 삭제
  deletePost: (postId) => publicApi.delete(`/community/posts/${postId}`),

  // 6. 게시글 좋아요
  likePost: (postId) => publicApi.post(`posts/${postId}/likes`),

  // 7. 게시글 좋아요 취소
  unlikePost: (postId) => publicApi.delete(`posts/${postId}/likes`),
}

export default postApi
