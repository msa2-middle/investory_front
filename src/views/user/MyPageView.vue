<template>
  <div class="container py-5" style="color: white;">
    <!--<h2 class="mb-4 text-center">마이페이지</h2>-->

    <!-- 상단 사용자 정보 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h4>{{ user.name }}</h4>
          <p><strong>이메일:</strong> {{ user.email }}</p>
          <p><strong>전화번호:</strong> {{ user.phone || '등록되지 않음' }}</p>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary" @click="showEditModal = true">내 정보 수정</button>
        </div>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <h6>내 게시글</h6>
          <p>{{ myPosts.length }} 개</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <h6>내 댓글</h6>
          <p>{{ myComments.length }} 개</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <h6>좋아요한 게시글</h6>
          <p>{{ likedPosts.length }} 개</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <h6>좋아요한 댓글</h6>
          <p>{{ likedComments.length }} 개</p>
        </div>
      </div>
    </div>

    <!-- 최근 작성한 게시글 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">최근 작성한 게시글</h5>
        <ul class="list-group">
          <li class="list-group-item" v-for="post in myPosts.slice(0, 5)" :key="post.postId">
            {{ post.title }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 최근 작성한 댓글 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">최근 작성한 댓글</h5>
        <ul class="list-group">
          <li class="list-group-item" v-for="comment in myComments.slice(0, 5)" :key="comment.commentId">
            {{ comment.content }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="custom-modal">
      <div class="custom-modal-content">
        <div class="d-flex justify-content-between mb-3">
          <h5>내 정보 수정</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <form @submit.prevent="updateInfo">
          <div class="mb-3">
            <label class="form-label">이름</label>
            <input v-model="editForm.name" type="text" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">전화번호</label>
            <input v-model="editForm.phone" type="text" class="form-control">
          </div>
          <button type="submit" class="btn btn-primary w-100">저장하기</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userApi from '@/api/userApi'

const user = ref({})
const myPosts = ref([])
const myComments = ref([])
const likedPosts = ref([])
const likedComments = ref([])
const showEditModal = ref(false)

const editForm = ref({
  name: '',
  phone: ''
})

async function fetchAll() {
  try {
    const resUser = await userApi.getMyPage()
    user.value = resUser.data
    editForm.value.name = resUser.data.name
    editForm.value.phone = resUser.data.phone

    const resPosts = await userApi.getMyPosts()
    myPosts.value = resPosts.data

    const resComments = await userApi.getMyComments()
    myComments.value = resComments.data

    const resLikedPosts = await userApi.getMyLikedPosts()
    likedPosts.value = resLikedPosts.data

    const resLikedComments = await userApi.getMyLikedComments()
    likedComments.value = resLikedComments.data

  } catch {
    alert('데이터 로딩 실패')
  }
}

async function updateInfo() {
  try {
    await userApi.updateMyInfo(editForm.value)
    alert('정보가 수정되었습니다.')
    closeModal()
    fetchAll()
  } catch {
    alert('수정 실패')
  }
}

function closeModal() {
  showEditModal.value = false
}

onMounted(fetchAll)
</script>

<style scoped>
.stat-card {
  background-color: #1c2230;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.stat-card h6 {
  margin-bottom: 10px;
  color: #bbbbbb;
}
.stat-card p {
  font-size: 20px;
  font-weight: bold;
}

.custom-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.custom-modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
</style>
