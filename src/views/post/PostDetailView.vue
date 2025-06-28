<template>
  <div class="post-detail">
    <div v-if="isLoading" class="loading">불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!post" class="no-data">게시글이 존재하지 않습니다.</div>
    <div v-else>
      <div class="post-author">{{ postAuthorName || '익명' }}</div>
      <h2 class="post-title">{{ post.title }}</h2>
      <div class="post-meta">
        <span>작성일: {{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="post-content">{{ post.content }}</div>
      <div class="post-stats">
        <div class="like-row">
          <span
            class="like-heart"
            :class="{ liked: liked }"
            @click="toggleLike"
          >{{ liked ? '♥' : '♡' }}</span>
          <span class="like-count">{{ post.likeCount || 0 }}</span>
        </div>
        <div class="comment-stats">
          <span class="comment-icon">💬</span>
          <span class="comment-count">{{ commentCount }}개의 댓글</span>
        </div>
      </div>
      <div class="button-group">
        <button class="edit-btn" @click="isEditMode = true">수정</button>
        <button class="delete-btn" @click="onDelete">삭제</button>
      </div>
      <div v-if="isEditMode" class="edit-form">
        <input v-model="editTitle" placeholder="제목" class="edit-input" />
        <textarea v-model="editContent" placeholder="내용" class="edit-textarea"></textarea>
        <div class="button-group">
          <button class="save-btn" @click="onEdit">저장</button>
          <button class="cancel-btn" @click="isEditMode = false">취소</button>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="comments-section">
        <h3 class="comments-title">댓글 {{ commentCount }}개</h3>
        <CommentSection
          :post-id="post.postId"
          @comment-count-updated="updateCommentCount"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import postApi from '@/api/postApi'
import CommentSection from '@/views/comment/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const postId = route.params.postId

const post = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isEditMode = ref(false)
const editTitle = ref('')
const editContent = ref('')
const liked = ref(false)
const postAuthorName = ref('')
const commentCount = ref(0)

async function fetchPost() {
  isLoading.value = true
  error.value = null
  post.value = null // 명시적으로 초기화

  try {
    console.log('Fetching post with ID:', postId) // 디버깅용

    if (!postId) {
      throw new Error('게시글 ID가 없습니다.')
    }

    const response = await postApi.getPost(postId)
    console.log('Post API response:', response) // 디버깅용

    // API 응답 구조 확인 및 처리
    if (!response || (!response.data && !response)) {
      throw new Error('게시글 데이터가 없습니다.')
    }

    // response.data가 있으면 사용, 없으면 response 자체 사용
    const postData = response.data || response

    if (!postData || !postData.postId) {
      throw new Error('유효하지 않은 게시글 데이터입니다.')
    }

    post.value = postData
    editTitle.value = postData.title || ''
    editContent.value = postData.content || ''

    // 작성자 이름 조회
    try {
      const authorRes = await postApi.getPostAuthorByPostId(postId)
      const authorData = authorRes.data || authorRes
      postAuthorName.value = authorData.authorName || authorData.name || '익명'
    } catch (authorError) {
      console.warn('작성자 정보 조회 실패:', authorError)
      postAuthorName.value = '익명'
    }

    // 좋아요 상태 조회
    try {
      const likeRes = await postApi.hasUserLiked(postId)
      const likeData = likeRes.data || likeRes
      liked.value = likeData === true || likeData === 'true'
    } catch (likeError) {
      console.warn('좋아요 상태 조회 실패:', likeError)
      liked.value = false
    }

  } catch (fetchError) {
    console.error('게시글 조회 실패:', fetchError)
    error.value = fetchError.message || '게시글을 불러오지 못했습니다.'
    post.value = null
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return ''
  }
}

// 게시글 수정
async function onEdit() {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  try {
    await postApi.updatePost(postId, {
      title: editTitle.value.trim(),
      content: editContent.value.trim()
    })
    alert('수정되었습니다.')
    isEditMode.value = false
    await fetchPost()
  } catch (e) {
    console.error('게시글 수정 실패:', e)
    let msg = '수정 실패'
    if (e.response?.data?.message) {
      msg = e.response.data.message
    } else if (e.message) {
      msg = e.message
    }
    alert(msg)
  }
}

// 게시글 삭제
async function onDelete() {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await postApi.deletePost(postId)
    alert('삭제되었습니다.')
    router.back()
  } catch (e) {
    console.error('게시글 삭제 실패:', e)
    let msg = '삭제 실패'
    if (e.response?.data?.message) {
      msg = e.response.data.message
    } else if (e.message) {
      msg = e.message
    }
    alert(msg)
  }
}

async function toggleLike() {
  if (!post.value) return

  try {
    if (liked.value) {
      await postApi.unlikePost(postId)
      liked.value = false
      post.value.likeCount = Math.max((post.value.likeCount || 1) - 1, 0)
    } else {
      await postApi.likePost(postId)
      liked.value = true
      post.value.likeCount = (post.value.likeCount || 0) + 1
    }
  } catch (e) {
    console.error('좋아요 처리 실패:', e)
    alert('좋아요 처리에 실패했습니다.')
  }
}

// 댓글 수 업데이트
function updateCommentCount(count) {
  commentCount.value = count || 0
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.post-detail {
  max-width: 600px;
  margin: 40px auto;
  background: #181c2f;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  padding: 32px 24px;
}
.loading, .error, .no-data {
  text-align: center;
  color: #a0aec0;
  padding: 40px 0;
  font-size: 1.1rem;
}
.error {
  color: #ef4444;
}
.post-author {
  font-size: 0.92rem;
  color: #60a5fa;
  font-weight: 500;
  margin-bottom: 2px;
}
.post-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.post-meta {
  font-size: 0.95rem;
  color: #a0aec0;
  margin-bottom: 18px;
  display: flex;
  gap: 18px;
}
.post-content {
  font-size: 1.08rem;
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 24px;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #23263a;
  border-radius: 8px;
}

.like-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-heart {
  font-size: .8rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
  color: #a0aec0;
  margin-right: 6px;
}
.like-heart.liked {
  color: #ef4444;
}
.like-heart:active {
  transform: scale(1.2);
}
.like-count {
  font-size: .8rem;
  color: #a0aec0;
  transition: color 0.2s;
}
.liked + .like-count {
  color: #ef4444;
}

.comment-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-icon {
  font-size: 1rem;
}

.comment-count {
  font-size: 0.9rem;
  color: #a0aec0;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}
.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn {
  background: #2563eb;
  color: #fff;
}
.delete-btn {
  background: #ef4444;
  color: #fff;
}
.save-btn {
  background: #059669;
  color: #fff;
}
.cancel-btn {
  background: #a0aec0;
  color: #181c2f;
}
.edit-form {
  margin-bottom: 24px;
  background: #23284a;
  padding: 18px;
  border-radius: 8px;
}
.edit-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #a0aec0;
  font-size: 1.1rem;
}
.edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #a0aec0;
  font-size: 1.1rem;
  margin-bottom: 10px;
  resize: vertical;
}

.comments-section {
  margin-top: 32px;
  border-top: 2px solid #374151;
  padding-top: 24px;
}

.comments-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #e2e8f0;
}
</style>
