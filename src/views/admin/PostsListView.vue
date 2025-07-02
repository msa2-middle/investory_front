<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4 text-center">게시글 관리</h2>

    <!-- 검색창 -->
    <div class="mb-3">
      <input
        v-model="searchText"
        type="text"
        class="form-control"
        placeholder="제목, 작성자 등으로 검색"
      />
    </div>

    <!-- 게시글 목록 테이블 -->
    <div class="bg-white p-3 rounded">
      <Vue3Datatable
        :rows="posts"
        :columns="columns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      >
        <!-- actions 슬롯 -->
        <template #actions="data">
          <div class="d-flex gap-2">
            <router-link
              :to="`/admin/posts/${data.value.postId}`"
              class="btn btn-sm btn-primary"
            >
              상세
            </router-link>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="deletePost(data.value)"
            >
              삭제
            </button>
          </div>
        </template>
      </Vue3Datatable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'
import adminApi from '@/api/adminApi'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchText = ref('')
const posts = ref([])

const rowsPerPage = ref(10)
const rowsPerPageOptions = [5, 10, 20, 50]

const columns = [
  { title: 'ID', field: 'postId', sortable: true },
  { title: '제목', field: 'title', sortable: true },
  { title: '작성자', field: 'authorName', sortable: true },
  { title: '생성일', field: 'createdAt', sortable: true },
  { title: '관리', field: 'actions' },
]

onMounted(loadPosts)

async function loadPosts() {
  try {
    const res = await adminApi.getAllPosts()
    posts.value = res.data.map((p) => ({
      postId: p.postId,
      title: p.title,
      authorName: p.authorName,
      createdAt: formatDate(p.createdAt || p.created_at),
    }))
  } catch (e) {
    console.error(e)
    alert('게시글 목록을 불러오는데 실패했습니다.')
  }
}

async function deletePost(post) {
  if (confirm(`정말로 게시글 "${post.title}" 을(를) 삭제하시겠습니까?`)) {
    try {
      await adminApi.deletePost(post.postId)
      alert('삭제 완료!')
      loadPosts()
    } catch (e) {
      console.error(e)
      alert('삭제 실패!')
    }
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
  max-width: 1000px;
}
</style>
