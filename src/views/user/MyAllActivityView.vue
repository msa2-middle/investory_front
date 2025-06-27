<template>
  <div class="container py-5 text-white">
    <h2 class="mb-5 text-center">내 활동 전체 보기</h2>

    <!-- 내가 작성한 게시글 -->
    <section class="mb-5">
      <h4 class="mb-3">📝 내가 작성한 게시글</h4>
      <SearchTable
        :items="myPosts"
        :columns="postColumns"
        searchPlaceholder="제목으로 검색"
      />
    </section>

    <!-- 내가 작성한 댓글 -->
    <section class="mb-5">
      <h4 class="mb-3">💬 내가 작성한 댓글</h4>
      <SearchTable
        :items="myComments"
        :columns="commentColumns"
        searchPlaceholder="댓글 내용 검색"
      />
    </section>

    <!-- 좋아요한 게시글 -->
    <section class="mb-5">
      <h4 class="mb-3">❤️ 좋아요한 게시글</h4>
      <SearchTable
        :items="likedPosts"
        :columns="postColumns"
        searchPlaceholder="제목으로 검색"
      />
    </section>

    <!-- 좋아요한 댓글 -->
    <section>
      <h4 class="mb-3">👍 좋아요한 댓글</h4>
      <SearchTable
        :items="likedComments"
        :columns="commentColumns"
        searchPlaceholder="댓글 내용 검색"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userApi from '@/api/userApi'
import SearchTable from '@/components/SearchTable.vue'

const myPosts = ref([])
const myComments = ref([])
const likedPosts = ref([])
const likedComments = ref([])

const postColumns = [
  { label: '제목', field: 'title' },
  { label: '작성일', field: 'createdAt' }
]

const commentColumns = [
  { label: '내용', field: 'content' },
  { label: '작성일', field: 'createdAt' }
]

onMounted(async () => {
  try {
    const res1 = await userApi.getMyPosts()
    const res2 = await userApi.getMyComments()
    const res3 = await userApi.getMyLikedPosts()
    const res4 = await userApi.getMyLikedComments()

    myPosts.value = res1.data.map(p => ({
      title: p.title,
      createdAt: formatDate(p.createdAt || p.created_at),
    }))

    myComments.value = res2.data.map(c => ({
      content: c.content,
      createdAt: formatDate(c.createdAt || c.created_at),
    }))

    likedPosts.value = res3.data.map(p => ({
      title: p.title,
      createdAt: formatDate(p.createdAt || p.created_at),
    }))

    likedComments.value = res4.data.map(c => ({
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
.table {
  border-radius: 8px;
  overflow: hidden;
}

/* 밝은 테이블 색상 */
.table.custom-table {
  background-color: #f8f9fa;
  color: #212529;
}

.table.custom-table thead th {
  background-color: #e9ecef;
  color: #212529;
  border: none;
}

.table.custom-table tbody td {
  background-color: #ffffff;
  border-top: 1px solid #dee2e6;
}

.table.custom-table tr:hover td {
  background-color: #f1f3f5;
}

.page-link {
  cursor: pointer;
}
</style>
