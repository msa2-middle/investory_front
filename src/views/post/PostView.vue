<template>
  <div class="post-board">
    <h2>{{ stockId }} 종목 자유게시판</h2>

    <!-- 글 작성 폼 -->
    <form class="post-form" @submit.prevent="addPost">
      <input v-model="newPost.title" placeholder="제목을 입력하세요" required />
      <textarea v-model="newPost.content" placeholder="내용을 입력하세요" required></textarea>
      <button type="submit" :disabled="isLoading">글 등록</button>
    </form>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">게시글을 불러오는 중...</div>

    <!-- 에러 메시지 -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 게시글 목록 -->
    <div v-else class="post-list">
      <div v-if="posts.length === 0" class="no-posts">등록된 글이 없습니다.</div>
      <div v-for="post in posts" :key="post.id" class="post-item" @click="openPost(post)">
        <div class="post-title">{{ post.title }}</div>
        <div class="post-meta">{{ formatDate(post.createdAt) }}</div>
        <div class="post-like">
          <button
            class="like-btn"
            @click.stop="toggleLike(post)"
            :disabled="post.likeLoading"
          >
            {{ post.liked ? '좋아요 취소' : '좋아요' }}
          </button>
          <span class="like-count">♥ {{ post.likeCount || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 게시글 상세 모달 -->
    <div v-if="selectedPost" class="modal-overlay" @click.self="selectedPost = null">
      <div class="modal-content">
        <h3>{{ selectedPost.title }}</h3>
        <div class="modal-date">{{ formatDate(selectedPost.createdAt) }}</div>
        <div class="modal-body">{{ selectedPost.content }}</div>
        <div class="post-like modal-like">
          <button
            class="like-btn"
            @click.stop="toggleLike(selectedPost)"
            :disabled="selectedPost.likeLoading"
          >
            {{ selectedPost.liked ? '좋아요 취소' : '좋아요' }}
          </button>
          <span class="like-count">♥ {{ selectedPost.likeCount || 0 }}</span>
        </div>
        <button @click="selectedPost = null">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import postApi from '@/api/postApi'

const route = useRoute()
const stockId = route.params.stockId

const posts = ref([])
const newPost = ref({ title: '', content: '' })
const selectedPost = ref(null)
const isLoading = ref(false)
const error = ref(null)

// 게시글 목록 조회
async function fetchPosts() {
  isLoading.value = true
  error.value = null
  try {
    const response = await postApi.getPostsByStock(stockId)
    // createdAt 기준 내림차순 정렬
    posts.value = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('게시글 조회 실패:', err)
    // error.value = '게시글을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 게시글 작성
async function addPost() {
  if (!newPost.value.title || !newPost.value.content) return

  try {
    const response = await postApi.createPost(stockId, {
      title: newPost.value.title,
      content: newPost.value.content
    })
    // 새 게시글을 목록 맨 위에 추가
    posts.value.unshift(response.data)
    newPost.value.title = ''
    newPost.value.content = ''
  } catch (err) {
    console.error('게시글 작성 실패:', err)
    error.value = '게시글 작성에 실패했습니다.'
  }
}

// 좋아요/좋아요 취소 토글
async function toggleLike(post) {
  if (post.likeLoading) return
  post.likeLoading = true
  try {
    if (post.liked) {
      await postApi.unlikePost(post.id)
      post.liked = false
      post.likeCount = (post.likeCount || 1) - 1
    } else {
      await postApi.likePost(post.id)
      post.liked = true
      post.likeCount = (post.likeCount || 0) + 1
    }
  } catch (err) {
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    post.likeLoading = false
  }
}

// 게시글 상세 보기
function openPost(post) {
  selectedPost.value = post
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

onMounted(fetchPosts)
</script>

<style scoped>
.post-board {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #181c2f;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}

h2 {
  margin-bottom: 24px;
  font-size: 2rem;
  text-align: center;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
}
.post-form input,
.post-form textarea {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #23263a;
  color: #fff;
  font-size: 1rem;
}
.post-form button {
  align-self: flex-end;
  padding: 8px 20px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-item {
  background: #23263a;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.post-item:hover {
  background: #2d3250;
}
.post-title {
  font-size: 1.1rem;
  font-weight: bold;
}
.post-meta {
  font-size: 0.9rem;
  color: #a0aec0;
  margin-top: 4px;
}
.no-posts {
  color: #a0aec0;
  text-align: center;
  padding: 32px 0;
}

.loading {
  color: #3b82f6;
  text-align: center;
  padding: 32px 0;
  font-size: 1.1rem;
}

.error {
  color: #ef4444;
  text-align: center;
  padding: 32px 0;
  font-size: 1.1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin: 16px 0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #23263a;
  padding: 32px 24px;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90vw;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.modal-content h3 {
  margin-bottom: 12px;
}
.modal-date {
  font-size: 0.9rem;
  color: #a0aec0;
  margin-bottom: 16px;
}
.modal-body {
  margin-bottom: 24px;
  white-space: pre-line;
}
.modal-content button {
  padding: 8px 20px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.post-like {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.like-btn {
  background: #23263a;
  color: #fff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s, color 0.2s;
}
.like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.like-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: #fff;
}
.like-count {
  color: #ef4444;
  font-weight: bold;
  font-size: 1rem;
}
.modal-like {
  margin-bottom: 16px;
}
</style>
