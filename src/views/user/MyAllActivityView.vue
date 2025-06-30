<template>
  <div class="container py-5 text-white">
    <h2 class="mb-5 text-center">내 활동 전체 보기</h2>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item" v-for="tab in tabs" :key="tab.key">
        <button
          class="nav-link"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </li>
    </ul>

    <!-- 검색창 추가 -->
    <div class="mb-3">
      <input
        v-model="searchText"
        type="text"
        class="form-control"
        placeholder="검색어를 입력하세요"
      />
    </div>

    <!-- 내가 작성한 게시글 -->
    <div v-if="activeTab === 'myPosts'" class="bg-white text-dark p-3 rounded">
      <Vue3Datatable
        :rows="myPosts"
        :columns="postColumns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      />
    </div>

    <!-- 내가 작성한 댓글 -->
    <div v-else-if="activeTab === 'myComments'" class="bg-white text-dark p-3 rounded">
      <Vue3Datatable
        :rows="myComments"
        :columns="commentColumns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      />
    </div>

    <!-- 좋아요한 게시글 -->
    <div v-else-if="activeTab === 'likedPosts'" class="bg-white text-dark p-3 rounded">
      <Vue3Datatable
        :rows="likedPosts"
        :columns="postColumns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      />
    </div>

    <!-- 좋아요한 댓글 -->
    <div v-else-if="activeTab === 'likedComments'" class="bg-white text-dark p-3 rounded">
      <Vue3Datatable
        :rows="likedComments"
        :columns="commentColumns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'
import userApi from '@/api/userApi'

const activeTab = ref('myPosts')
const rowsPerPage = ref(5)
const rowsPerPageOptions = [5, 10, 20, 50]

const searchText = ref('')

const tabs = [
  { key: 'myPosts', label: '작성한 게시글' },
  { key: 'myComments', label: '작성한 댓글' },
  { key: 'likedPosts', label: '좋아요한 게시글' },
  { key: 'likedComments', label: '좋아요한 댓글' },
]

const myPosts = ref([])
const myComments = ref([])
const likedPosts = ref([])
const likedComments = ref([])

const postColumns = [
  {
    title: '제목',
    field: 'title',
    sortable: true,
  },
  {
    title: '작성일',
    field: 'createdAt',
    sortable: true,
  },
]

const commentColumns = [
  {
    title: '내용',
    field: 'content',
    sortable: true,
  },
  {
    title: '작성일',
    field: 'createdAt',
    sortable: true,
  },
]

onMounted(async () => {
  try {
    const res1 = await userApi.getMyPosts()
    const res2 = await userApi.getMyComments()
    const res3 = await userApi.getMyLikedPosts()
    const res4 = await userApi.getMyLikedComments()

    myPosts.value = res1.data.map((p) => ({
      title: p.title,
      createdAt: formatDate(p.createdAt || p.created_at),
    }))

    myComments.value = res2.data.map((c) => ({
      content: c.content,
      createdAt: formatDate(c.createdAt || c.created_at),
    }))

    likedPosts.value = res3.data.map((p) => ({
      title: p.title,
      createdAt: formatDate(p.createdAt || p.created_at),
    }))

    likedComments.value = res4.data.map((c) => ({
      content: c.content,
      createdAt: formatDate(c.createdAt || c.created_at),
    }))
  } catch (e) {
    console.error(e)
    alert('데이터 로딩 실패')
  }
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #fff;
}
.nav-tabs .nav-link.active {
  color: #212529;
  background-color: #fff;
}
.container {
  max-width: 1000px;
}
.bh-table-responsive table {
  background-color: #ffffff !important;
  color: #212529 !important;
}
.bh-table-responsive th,
.bh-table-responsive td {
  background-color: #f1f1f1 !important;
  color: #212529 !important;
}
.bh-text-black {
  color: #212529 !important;
}
.bh-table-responsive thead {
  display: table-header-group !important;
}
</style>
