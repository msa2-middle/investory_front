<template>
  <div class="post-detail">
    <div v-if="isLoading" class="loading">불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!post" class="no-data">게시글이 존재하지 않습니다.</div>
    <div v-else>
      <h2 class="post-title">{{ post.title }}</h2>
      <div class="post-meta">
        <span>작성일: {{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="post-content">{{ post.content }}</div>
      <div class="like-row">
        <span
          class="like-heart"
          :class="{ liked: liked }"
          @click="toggleLike"
          >{{ liked ? '♥' : '♡' }}</span>
        <span class="like-count">{{ post.likeCount || 0 }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import postApi from '@/api/postApi'

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

async function fetchPost() {
  isLoading.value = true
  error.value = null
  try {
    const response = await postApi.getPost(postId)
    post.value = response.data
    editTitle.value = response.data.title
    editContent.value = response.data.content
    // 좋아요 상태 동기화
    try {
      const res = await postApi.hasUserLiked(postId)
      liked.value = res.data === true
    } catch {
      liked.value = false
    }
  } catch {
    error.value = '게시글을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

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

// 게시글 수정 
async function onEdit() {
  try {
    await postApi.updatePost(postId, {
      title: editTitle.value,
      content: editContent.value
    })
    alert('수정되었습니다.')
    isEditMode.value = false
    await fetchPost()
  } catch (e) {
    let msg = '수정 실패'
    if (e.response && e.response.data && e.response.data.message) {
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
    console.error(e)
    let msg = '삭제 실패'
    if (e.response && e.response.data && e.response.data.message) {
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
      post.value.likeCount = (post.value.likeCount || 1) - 1
    } else {
      await postApi.likePost(postId)
      liked.value = true
      post.value.likeCount = (post.value.likeCount || 0) + 1
    }
  } catch {
    alert('좋아요 처리에 실패했습니다.')
  }
}

onMounted(fetchPost)
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
.post-content {
  font-size: 1.08rem;
  line-height: 1.7;
  white-space: pre-line;
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 18px;
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
  margin-top: 24px;
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
.like-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
