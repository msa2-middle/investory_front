<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4">댓글 상세 정보</h2>

    <div v-if="comment" class="bg-white p-4 rounded">
      <div class="mb-3">
        <label class="form-label">댓글 ID</label>
        <input type="text" class="form-control" v-model="comment.commentId" readonly />
      </div>
      <div class="mb-3">
        <label class="form-label">게시글 제목</label>
        <input type="text" class="form-control" v-model="comment.postTitle" readonly />
      </div>
      <div class="mb-3">
        <label class="form-label">작성자</label>
        <input type="text" class="form-control" v-model="comment.authorName" readonly />
      </div>
      <div class="mb-3">
        <label class="form-label">내용</label>
        <textarea class="form-control" v-model="comment.content" rows="4"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">작성일</label>
        <input type="text" class="form-control" v-model="comment.createdAt" readonly />
      </div>
      <button class="btn btn-primary" @click="saveComment">저장</button>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import adminApi from '@/api/adminApi'

const route = useRoute()
const router = useRouter()

const comment = ref(null)

onMounted(async () => {
  try {
    const res = await adminApi.getCommentById(route.params.id)
    comment.value = {
      commentId: res.data.commentId,
      postTitle: res.data.postTitle,
      authorName: res.data.userName,
      content: res.data.content,
      createdAt: formatDate(res.data.createdAt || res.data.created_at),
    }
  } catch (e) {
    console.error(e)
    alert('댓글 정보를 불러오지 못했습니다.')
    router.push('/admin/comments')
  }
})

async function saveComment() {
  try {
    await adminApi.updateComment(comment.value.commentId, {
      content: comment.value.content,
    })
    alert('수정 완료!')
    router.push('/admin/comments')
  } catch (e) {
    console.error(e)
    alert('수정 실패!')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
