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
      <div v-for="post in posts" :key="post.postId" class="post-item" @click="openPost(post)">
        <div class="post-author">{{ post.authorName || '익명' }}</div>
        <div class="post-title">{{ post.title }}</div>
        <div class="post-meta">{{ formatDate(post.createdAt) }}</div>
        <div class="post-like">
          <span
            class="like-heart"
            :class="{ liked: post.liked }"
            @click.stop="toggleLike(post)"
            :disabled="post.likeLoading"
            >{{ post.liked ? '♥' : '♡' }}</span>
          <span class="like-count">{{ post.likeCount || 0 }}</span>
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
const stockId = route.params.stockId

const posts = ref([])
const newPost = ref({ title: '', content: '' })
const isLoading = ref(false)
const error = ref(null)

// 게시글 목록 조회
async function fetchPosts() {
  isLoading.value = true
  error.value = null
  try {
    const response = await postApi.getPostsByStock(stockId)
    // 각 게시글에 대해 hasUserLiked, 작성자 이름 동기화
    const postsWithLikeAndAuthor = await Promise.all(
      (response.data || []).map(async (post) => {
        let liked = false
        let authorName = '익명'
        try {
          const res = await postApi.hasUserLiked(post.postId)
          liked = res.data === true
        } catch {
          liked = false
        }
        try {
          const authorRes = await postApi.getPostAuthorByPostId(post.postId)
          authorName = authorRes.data.authorName || authorRes.data.name || '익명'
        } catch {
          authorName = '익명'
        }
        return { ...post, liked, authorName }
      })
    )
    posts.value = postsWithLikeAndAuthor.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch {
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
    // 새 게시글에 대해 작성자 이름 동기화
    let authorName = '익명'
    try {
      const authorRes = await postApi.getPostAuthorByPostId(response.data.postId)
      authorName = authorRes.data.authorName || authorRes.data.name || '익명'
    } catch {
      authorName = '익명'
    }
    // 새 게시글을 목록 맨 위에 추가
    posts.value.unshift({ ...response.data, authorName })
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
      await postApi.unlikePost(post.postId)
      post.liked = false
      post.likeCount = (post.likeCount || 1) - 1
    } else {
      await postApi.likePost(post.postId)
      post.liked = true
      post.likeCount = (post.likeCount || 0) + 1
    }
  } catch {
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    post.likeLoading = false
  }
}

// 게시글 상세 보기
function openPost(post) {
  console.log('openPost postId:', post)
  router.push({ name: 'postDetail', params: { postId: post.postId } })
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
.post-author {
  font-size: 0.92rem;
  color: #60a5fa;
  font-weight: 500;
  margin-bottom: 2px;
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
.modal-like {
  margin-bottom: 16px;
}
</style>
