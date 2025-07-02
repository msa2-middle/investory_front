<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4">게시글 상세</h2>

    <div v-if="post" class="bg-white p-4 rounded">
      <div class="mb-3">
        <label class="form-label">제목</label>
        <input type="text" class="form-control" v-model="post.title" />
      </div>
      <div class="mb-3">
        <label class="form-label">내용</label>
        <textarea class="form-control" v-model="post.content" rows="6"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">작성자</label>
        <input type="text" class="form-control" v-model="post.name" readonly />
      </div>
      <button class="btn btn-primary" @click="savePost">저장</button>
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

const post = ref(null)

onMounted(async () => {
  try {
    const res = await adminApi.getPostById(route.params.id)
    post.value = res.data
  } catch (e) {
    console.error(e)
    alert('게시글 정보를 불러오지 못했습니다.')
    router.push('/admin/posts')
  }
})

async function savePost() {
  try {
    await adminApi.updatePost(post.value.postId, {
      title: post.value.title,
      content: post.value.content,
    })
    alert('수정 완료!')
    router.push('/admin/posts')
  } catch (e) {
    console.error(e)
    alert('수정 실패!')
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
