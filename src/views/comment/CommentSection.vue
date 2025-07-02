<template>
  <div class="comment-section">
    <!-- 댓글 작성 폼 -->
    <div class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="댓글을 입력하세요..."
        class="comment-input"
        rows="3"
      ></textarea>
      <button
        @click="addComment"
        :disabled="!newComment.trim() || isSubmitting"
        class="comment-submit-btn"
      >
        {{ isSubmitting ? '등록 중...' : '댓글 등록' }}
      </button>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment-list">
      <div v-if="isLoading" class="comment-loading">댓글을 불러오는 중...</div>
      <div v-else-if="comments.length === 0" class="no-comments">
        첫 번째 댓글을 남겨보세요!
      </div>
      <div v-else>
        <div
          v-for="comment in comments"
          :key="comment.commentId"
          class="comment-item"
        >
          <div class="comment-author">{{ comment.userName || '익명' }}</div>
          <div v-if="!comment.isEditing" class="comment-content">
            {{ comment.content }}
          </div>
          <div v-else class="comment-edit-form">
            <textarea
              v-model="comment.editContent"
              class="comment-edit-input"
              rows="3"
            ></textarea>
            <div class="comment-edit-buttons">
              <button @click="saveEdit(comment)" class="save-btn">저장</button>
              <button @click="cancelEdit(comment)" class="cancel-btn">취소</button>
            </div>
          </div>
          <div class="comment-meta">
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            <div class="comment-actions">
              <!-- 댓글 좋아요 -->
              <div class="comment-like">
                <span
                  class="like-heart"
                  :class="{ liked: comment.liked }"
                  @click="toggleCommentLike(comment)"
                  :disabled="comment.likeLoading"
                >{{ comment.liked ? '♥' : '♡' }}</span>
                <span class="like-count">{{ comment.likeCount || 0 }}</span>
              </div>
              <button @click="startEdit(comment)" class="edit-btn">수정</button>
              <button @click="deleteComment(comment)" class="delete-btn">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import commentApi from '@/api/commentApi.js'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['comment-count-updated'])

const comments = ref([])
const newComment = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)

// 댓글 목록 조회
async function fetchComments() {
  if (!props.postId) return

  isLoading.value = true
  try {
    const response = await commentApi.getCommentsByPost(props.postId)

    // 각 댓글에 대해 좋아요 상태 및 기타 정보 설정
    const commentsWithDetails = await Promise.all(
      (response.data || []).map(async (comment) => {
        let liked = false

        try {
          const likeRes = await commentApi.checkCommentLikeStatus(comment.commentId)
          liked = likeRes.data === true
        } catch {
          liked = false
        }

        return {
          ...comment,
          userName: comment.userName || '익명',
          isEditing: false,
          editContent: comment.content,
          liked,
          likeCount: comment.likeCount || 0,
          likeLoading: false
        }
      })
    )

    comments.value = commentsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // 댓글 수 업데이트 이벤트 발생
    emit('comment-count-updated', comments.value.length)
  } catch (error) {
    console.error('댓글 조회 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 댓글 작성
async function addComment() {
  if (!newComment.value.trim()) return

  isSubmitting.value = true
  try {
    const response = await commentApi.createComment(props.postId, {
      content: newComment.value.trim()
    })

    console.log("데이터구조 => ", response.data);

    // 새 댓글을 목록에 추가
    const newCommentData = {
      ...response.data,
      userName: response.data.userName || '익명',
      isEditing: false,
      editContent: response.data.content,
      liked: false,
      likeCount: 0,
      likeLoading: false
    }
    comments.value.unshift(newCommentData)
    newComment.value = ''

    // 댓글 수 업데이트
    emit('comment-count-updated', comments.value.length)
    alert('댓글이 생성되었습니다.')
  } catch (error) {
    console.error('댓글 작성 실패:', error)
    alert('댓글 작성에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 댓글 수정 시작
function startEdit(comment) {
  comment.isEditing = true
  comment.editContent = comment.content
}

// 댓글 수정 취소
function cancelEdit(comment) {
  comment.isEditing = false
  comment.editContent = comment.content
}

// 댓글 수정 저장
async function saveEdit(comment) {
  if (!comment.editContent.trim()) return

  try {
    await commentApi.updateComment(props.postId, comment.commentId, {
      content: comment.editContent.trim()
    })

    comment.content = comment.editContent.trim()
    comment.isEditing = false
    alert('댓글이 수정되었습니다.')
  } catch (error) {
    console.error('댓글 수정 실패:', error)
    alert('댓글 수정에 실패했습니다.')
  }
}

// 댓글 삭제
async function deleteComment(comment) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return

  try {
    await commentApi.deleteComment(props.postId, comment.commentId)

    const index = comments.value.findIndex(c => c.commentId === comment.commentId)
    if (index > -1) {
      comments.value.splice(index, 1)
    }

    // 댓글 수 업데이트
    emit('comment-count-updated', comments.value.length)
    alert('댓글이 삭제되었습니다.')
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
    alert('댓글 삭제에 실패했습니다.')
  }
}

// 댓글 좋아요/좋아요 취소 토글 (토글 API 방식)
async function toggleCommentLike(comment) {
  if (comment.likeLoading) return

  comment.likeLoading = true
  try {
    // 현재 상태를 먼저 토글 (즉시 반응)
    const wasLiked = comment.liked
    comment.liked = !wasLiked
    comment.likeCount = comment.liked ? (comment.likeCount || 0) + 1 : (comment.likeCount || 1) - 1

    // API 호출
    const response = await commentApi.likeComment(props.postId, comment.commentId)

    // 서버 응답이 있다면 서버 데이터로 동기화
    if (response.data && typeof response.data.isLiked !== 'undefined') {
      comment.liked = response.data.isLiked
      comment.likeCount = response.data.likeCount || 0
    }
  } catch (error) {
    console.error('댓글 좋아요 처리 실패:', error)
    // 실패 시 원래 상태로 롤백
    comment.liked = wasLiked
    comment.likeCount = wasLiked ? (comment.likeCount || 0) + 1 : (comment.likeCount || 1) - 1
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    comment.likeLoading = false
  }
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// props 변화 감지
watch(() => props.postId, () => {
  if (props.postId) {
    fetchComments()
  }
})

onMounted(() => {
  if (props.postId) {
    fetchComments()
  }
})
</script>

<style scoped>
.comment-section {
  margin-top: 24px;
  border-top: 1px solid #374151;
  padding-top: 24px;
}

.comment-form {
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #23263a;
  color: #fff;
  font-size: 0.95rem;
  resize: vertical;
  margin-bottom: 12px;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-submit-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
}

.comment-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-loading {
  text-align: center;
  color: #a0aec0;
  padding: 20px 0;
}

.no-comments {
  text-align: center;
  color: #a0aec0;
  padding: 20px 0;
  font-style: italic;
}

.comment-item {
  background: #23263a;
  padding: 20px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 0.85rem;
  color: #60a5fa;
  font-weight: 500;
  margin-bottom: 8px;
}

.comment-content {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: pre-line;
  color: #e2e8f0;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  font-size: 0.8rem;
  color: #a0aec0;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-like {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-heart {
  font-size: 0.9rem;
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
  font-size: 0.8rem;
  color: #a0aec0;
  transition: color 0.2s;
}

.liked + .like-count {
  color: #ef4444;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #2563eb;
  color: #fff;
}

.edit-btn:hover {
  background: #1d4ed8;
}

.delete-btn {
  background: #ef4444;
  color: #fff;
}

.delete-btn:hover {
  background: #dc2626;
}

.comment-edit-form {
  margin-bottom: 12px;
}

.comment-edit-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #1a1d29;
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 8px;
  resize: vertical;
}

.comment-edit-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-edit-buttons {
  display: flex;
  gap: 8px;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #059669;
  color: #fff;
}

.save-btn:hover {
  background: #047857;
}

.cancel-btn {
  background: #6b7280;
  color: #fff;
}

.cancel-btn:hover {
  background: #4b5563;
}
</style>
