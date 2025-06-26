<template>
  <div class="post-detail">
    <div v-if="isLoading" class="loading">불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!post" class="no-data">게시글이 존재하지 않습니다.</div>
    <div v-else>
      <h2 class="post-title">{{ post.title }}</h2>
      <div class="post-meta">
        <span>작성일: {{ formatDate(post.createdAt) }}</span>
        <span class="like-count">♥ {{ post.likeCount || 0 }}</span>
      </div>
      <div class="post-content">{{ post.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import postApi from '@/api/postApi'

const route = useRoute()
const postId = route.params.postId

const post = ref(null)
const isLoading = ref(false)
const error = ref(null)

async function fetchPost() {
  isLoading.value = true
  error.value = null
  try {
    const response = await postApi.getPost(postId)
    post.value = response.data
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
.like-count {
  color: #ef4444;
  font-weight: bold;
}
.post-content {
  font-size: 1.08rem;
  line-height: 1.7;
  white-space: pre-line;
}
</style>
