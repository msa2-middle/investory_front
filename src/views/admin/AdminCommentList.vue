<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4 text-center">댓글 관리</h2>

    <!-- 검색창 -->
    <div class="mb-3">
      <input
        v-model="searchText"
        type="text"
        class="form-control"
        placeholder="내용, 작성자 등으로 검색"
      />
    </div>

    <!-- 댓글 목록 테이블 -->
    <div class="bg-white p-3 rounded">
      <Vue3Datatable
        :rows="comments"
        :columns="columns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      >
        <!-- content slot (말줄임 처리) -->
        <template #content="data">
          <span class="ellipsis-cell" :title="data.value.content">
            {{ data.value.content }}
          </span>
        </template>

        <!-- actions slot -->
        <template #actions="data">
          <div class="d-flex gap-2">
            <router-link
              :to="`/admin/comments/${data.value.commentId}`"
              class="btn btn-sm btn-primary"
            >
              상세
            </router-link>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="deleteComment(data.value)"
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
import { useRouter } from 'vue-router'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'
import adminApi from '@/api/adminApi'

const router = useRouter()

const searchText = ref('')
const comments = ref([])

const rowsPerPage = ref(10)
const rowsPerPageOptions = [5, 10, 20, 50]

const columns = [
  { title: 'ID', field: 'commentId', sortable: true },
  { title: '게시글 제목', field: 'postTitle', sortable: true },
  { title: '작성자', field: 'authorName', sortable: true },
  { title: '내용', field: 'content', sortable: true },
  { title: '생성일', field: 'createdAt', sortable: true },
  { title: '관리', field: 'actions' },
]

onMounted(loadComments)

async function loadComments() {
  try {
    const res = await adminApi.getAllComments()
    comments.value = res.data.map((c) => ({
      commentId: c.commentId,
      postTitle: c.postTitle,
      authorName: c.userName,
      content: c.content,
      createdAt: formatDate(c.createdAt || c.created_at),
    }))
  } catch (e) {
    console.error(e)
    alert('댓글 목록을 불러오는데 실패했습니다.')
  }
}

async function deleteComment(comment) {
  if (confirm(`정말로 댓글을 삭제하시겠습니까?`)) {
    try {
      await adminApi.deleteComment(comment.commentId)
      alert('삭제 완료!')
      loadComments()
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

/* 말줄임 스타일 */
.ellipsis-cell {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
