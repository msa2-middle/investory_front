<template>
  <div class="post-board">
    <div v-if="stockPrice" class="stock-price-top">현재가: {{ Number(stockPrice).toLocaleString() }}원</div>
    <h2 class="stock-title-bar">
      <template v-if="stockName">
        <span class="stock-name-main">{{ stockName }}</span>
        <span class="stock-ticker-main">({{ stockId }})</span>
        <span class="stock-board-label">종목 커뮤니티</span>
      </template>
      <template v-else>
        {{ stockId }} 종목 커뮤니티
      </template>
    </h2>

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
      <div v-for="post in posts" :key="post.postId" class="post-container">
        <!-- 게시글 아이템 -->
        <div class="post-item">
          <div class="post-author">{{ post.authorName || '익명' }}</div>
          <div class="post-title clickable" @click="openPost(post)">{{ post.title }}</div>
          <div class="post-meta">{{ formatDate(post.createdAt) }}</div>
          <div class="post-actions">
            <div class="post-like">
              <span
                class="like-heart"
                :class="{ liked: post.liked }"
                @click.stop="toggleLike(post)"
                :disabled="post.likeLoading"
              >{{ post.liked ? '♥' : '♡' }}</span>
              <span class="like-count">{{ post.likeCount || 0 }}</span>
            </div>
            <div class="post-comment">
              <span
                class="comment-icon"
                @click.stop="toggleComments(post)"
                :class="{ active: post.showComments }"
              >💬</span>
              <span class="comment-count">{{ post.commentCount || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div v-if="post.showComments" class="comment-section-wrapper">
          <CommentSection
            :post-id="post.postId"
            @comment-count-updated="updateCommentCount(post, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import postApi from '@/api/postApi'
import stockApi from '@/api/stockApi'
import commentApi from '@/api/commentApi'
import CommentSection from '@/views/comment/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const stockId = route.params.stockId

const posts = ref([])
const newPost = ref({ title: '', content: '' })
const isLoading = ref(false)
const error = ref(null)
const stockName = ref('')
const stockPrice = ref('')

// 게시글 목록 조회
async function fetchPosts() {
  isLoading.value = true
  error.value = null
  try {
    const response = await postApi.getPostsByStock(stockId)
    // 각 게시글에 대해 hasUserLiked, 작성자 이름, 댓글 수 동기화
    const postsWithDetails = await Promise.all(
      (response.data || []).map(async (post) => {
        let liked = false
        let authorName = '익명'
        let commentCount = 0

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

        try {
          const commentRes = await commentApi.getCommentsByPost(post.postId)
          commentCount = (commentRes.data || []).length
        } catch {
          commentCount = 0
        }

        return {
          ...post,
          liked,
          authorName,
          commentCount,
          showComments: false
        }
      })
    )
    posts.value = postsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    posts.value.unshift({
      ...response.data,
      authorName,
      commentCount: 0,
      showComments: false
    })
    newPost.value.title = ''
    newPost.value.content = ''
  }

  catch (err) {
    console.error('게시글 작성 실패:', err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.data) {
      error.value = err.response.data
    } else {
      error.value = '게시글 작성에 실패했습니다.'
    }
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
  } catch (err) {
    console.error('좋아요 처리 실패:', err)
    if (err.response?.data?.message) {
      alert(err.response.data.message)
    } else if (err.response?.data) {
      alert(typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data)
    } else {
      alert('좋아요 처리에 실패했습니다.')
    }
  } finally {
    post.likeLoading = false
  }
}

// 댓글 토글
function toggleComments(post) {
  post.showComments = !post.showComments
}

// 댓글 수 업데이트
function updateCommentCount(post, count) {
  post.commentCount = count
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

async function fetchStockInfo() {
  try {
    const res = await stockApi.getStockInfo(stockId)
    stockName.value = res.data.prdtName || ''

    // 주가 정보도 함께 불러오기
    try {
      const priceRes = await stockApi.getStockPrice(stockId)
      stockPrice.value = priceRes.data.output?.stck_prpr || ''
    } catch {
      stockPrice.value = ''
    }
  } catch {
    stockName.value = ''
    stockPrice.value = ''
  }
}

onMounted(() => {
  fetchStockInfo()
  fetchPosts()
})
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

.post-container {
  background: #23263a;
  border-radius: 8px;
  overflow: hidden;
}

.post-item {
  padding: 16px;
  /* cursor 제거 - 전체 영역 클릭 비활성화 */
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
  margin-bottom: 8px;
}

/* 제목만 클릭 가능하도록 스타일 추가 */
.post-title.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}
.post-title.clickable:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.post-meta {
  font-size: 0.9rem;
  color: #a0aec0;
  margin-bottom: 8px;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-like {
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

.post-comment {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-icon {
  font-size: 1rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s;
  padding: 4px;
}

.comment-icon:hover {
  transform: scale(1.1);
}

.comment-icon.active {
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
}

.comment-count {
  font-size: 0.8rem;
  color: #a0aec0;
}

.comment-section-wrapper {
  border-top: 1px solid #374151;
  padding: 16px;
  background: #1a1d29;
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

.stock-title-bar {
  margin-bottom: 24px;
  text-align: center;
}
.stock-name-main {
  font-size: 1.1rem;
  font-weight: bold;
  margin-right: 8px;
  color: #fff;
}
.stock-ticker-main {
  font-size: 1.15rem;
  color: #60a5fa;
  margin-right: 12px;
}
.stock-board-label {
  font-size: 1.1rem;
  color: #a0aec0;
}
.stock-price-top {
  text-align: center;
  font-size: 1.5rem;
  color: #22d3ee;
  font-weight: bold;
  margin-bottom: 4px;
}
</style>
