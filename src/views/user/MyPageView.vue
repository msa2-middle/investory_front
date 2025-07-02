<template>
  <div class="container py-5" style="color: white;">
    <!--<h2 class="mb-4 text-center">마이페이지</h2>-->

    <!-- 상단 사용자 정보 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body d-flex justify-content-between align-items-start">
        <!-- 왼쪽: 사용자 정보 -->
        <div>
          <h4>{{ user.name }}</h4>
          <br>
          <p><strong>이메일:</strong> {{ user.email }}</p>
          <p><strong>전화번호:</strong> {{ user.phone || '등록되지 않음' }}</p>
        </div>

        <!-- 오른쪽: 버튼 -->
        <div>
          <div class="dropdown">
  <button
    class="btn btn-sm btn-outline-primary dropdown-toggle"
    type="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    내 정보 관리
  </button>
  <ul class="dropdown-menu">
    <li>
      <a class="dropdown-item" href="#" @click.prevent="openEditModal">내 정보 수정</a>
    </li>
    <li>
      <a class="dropdown-item" href="#" @click.prevent="openPasswordModal">비밀번호 변경</a>
    </li>
    <li>
      <a class="dropdown-item text-danger" href="#" @click.prevent="openWithdrawModal">
        회원 탈퇴
      </a>
  </li>
  </ul>
</div>
        </div>
      </div>
    </div>


    <!-- 통계 카드 -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3" v-for="(value, label) in statMap" :key="label">
        <div class="stat-card">
          <h6>{{ label }}</h6>
          <p>{{ value }} 개</p>
        </div>
      </div>
    </div>


    <!-- 탭 메뉴 -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">내 게시글</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'">내 댓글</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'likedPosts' }" @click="activeTab = 'likedPosts'">좋아요한 게시글</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'likedComments' }" @click="activeTab = 'likedComments'">좋아요한 댓글</a>
      </li>
    </ul>

    <!-- 탭 내용 -->
    <div v-if="activeTab === 'posts'" class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">최근 작성한 게시글</h5>

        <!-- 게시글이 있을 때 -->
        <div v-if="myPosts.length > 0">
          <ul class="list-group">
            <li class="list-group-item" v-for="post in myPosts.slice(0, 5)" :key="post.postId">
              {{ post.title }}
            </li>
          </ul>

          <!-- 게시글이 5개 초과일 때만 전체 보기 링크 -->
          <div v-if="myPosts.length > 5" class="text-center mt-3">
            <router-link to="/my-activities" class="text-muted" style="font-weight: bold; text-decoration: none;">
      활동 전체 보기 &gt;
    </router-link>
          </div>
        </div>

        <!-- 게시글이 아예 없을 때 -->
        <div v-else class="text-center text-muted py-3">
          작성한 게시글이 없습니다.
        </div>
      </div>
    </div>


    <!-- 최근 작성한 댓글 -->
<div v-if="activeTab === 'comments'" class="card shadow-sm mb-4">
  <div class="card-body">
    <h5 class="mb-3">최근 작성한 댓글</h5>

    <div v-if="myComments.length > 0">
      <ul class="list-group">
        <li class="list-group-item" v-for="comment in myComments.slice(0, 5)" :key="comment.commentId">
          {{ comment.content }}
        </li>
      </ul>
      <div v-if="myComments.length > 5" class="text-center mt-3">
        <router-link to="/my-comments" class="text-muted" style="font-weight: bold; text-decoration: none;">
          작성한 댓글 전체 보기 &gt;
        </router-link>
      </div>
    </div>

    <div v-else class="text-center text-muted py-3">
      작성한 댓글이 없습니다.
    </div>
  </div>
</div>

<!-- 좋아요한 게시글 -->
<div v-if="activeTab === 'likedPosts'" class="card shadow-sm mb-4">
  <div class="card-body">
    <h5 class="mb-3">좋아요한 게시글</h5>

    <div v-if="likedPosts.length > 0">
      <ul class="list-group">
        <li class="list-group-item" v-for="post in likedPosts.slice(0, 5)" :key="post.postId">
          {{ post.title }}
        </li>
      </ul>
      <div v-if="likedPosts.length > 5" class="text-center mt-3">
        <router-link to="/liked-posts" class="text-muted" style="font-weight: bold; text-decoration: none;">
          좋아요한 게시글 전체 보기 &gt;
        </router-link>
      </div>
    </div>

    <div v-else class="text-center text-muted py-3">
      좋아요한 게시글이 없습니다.
    </div>
  </div>
</div>

<!-- 좋아요한 댓글 -->
<div v-if="activeTab === 'likedComments'" class="card shadow-sm mb-4">
  <div class="card-body">
    <h5 class="mb-3">좋아요한 댓글</h5>

    <div v-if="likedComments.length > 0">
      <ul class="list-group">
        <li class="list-group-item" v-for="comment in likedComments.slice(0, 5)" :key="comment.commentId">
          {{ comment.content }}
        </li>
      </ul>
      <div v-if="likedComments.length > 5" class="text-center mt-3">
        <router-link to="/liked-comments" class="text-muted" style="font-weight: bold; text-decoration: none;">
          좋아요한 댓글 전체 보기 &gt;
        </router-link>
      </div>
    </div>

    <div v-else class="text-center text-muted py-3">
      좋아요한 댓글이 없습니다.
    </div>
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

    <!-- 비밀번호 변경 모달 -->
<div v-if="showPasswordModal" class="custom-modal">
  <div class="custom-modal-content">
    <div class="d-flex justify-content-between mb-3">
      <h5>비밀번호 변경</h5>
      <button class="btn-close" @click="closePasswordModal"></button>
    </div>

    <form @submit.prevent="updatePassword">
      <div class="mb-3">
        <label class="form-label">현재 비밀번호</label>
        <input
          v-model="passwordForm.currentPassword"
          type="password"
          class="form-control"
          required
        >
      </div>

      <div class="mb-3">
        <label class="form-label">새 비밀번호</label>
        <input
          v-model="passwordForm.newPassword"
          type="password"
          class="form-control"
          required
        >
        <p
          v-if="passwordForm.newPassword"
          class="password-strength"
          :class="passwordChangeStrengthClass"
        >
          {{ passwordChangeStrengthMessage }}
        </p>
      </div>

      <div class="mb-3">
        <label class="form-label">새 비밀번호 확인</label>
        <input
          v-model="passwordForm.confirmPassword"
          type="password"
          class="form-control"
          required
        >
        <p
          v-if="passwordMismatchMessage"
          class="password-strength weak"
        >
          {{ passwordMismatchMessage }}
        </p>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="!isPasswordFormValid"
      >
        변경하기
      </button>
    </form>
  </div>
</div>

<!-- 회원 탈퇴 모달 -->
<div v-if="showWithdrawModal" class="custom-modal">
  <div class="custom-modal-content">
    <div class="d-flex justify-content-between mb-3">
      <h5 style="color: #333;">회원 탈퇴</h5>
      <button class="btn-close" @click="closeWithdrawModal"></button>
    </div>
    <p class="mb-3" style="color: #333;">
  정말 회원 탈퇴를 진행하시겠습니까?<br>
  탈퇴 후 계정 복구는 불가능합니다.
</p>

<div class="mb-3">
  <label class="form-label">비밀번호 확인</label>
  <input
    type="password"
    class="form-control"
    v-model="withdrawPassword"
    required
  />
  <p v-if="withdrawError" class="text-danger mt-2">
    {{ withdrawError }}
  </p>
</div>

<button
  class="btn btn-danger w-100"
  @click="withdrawUser"
  :disabled="!withdrawPassword"
>
  탈퇴하기
</button>

  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import userApi from '@/api/userApi'

const user = ref({})
const myPosts = ref([])
const myComments = ref([])
const likedPosts = ref([])
const likedComments = ref([])
const activeTab = ref('posts')
const withdrawPassword = ref('')
const withdrawError = ref('')
const editForm = ref({ name: '', phone: '' })

// 모달 제어 ref 추가
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showWithdrawModal = ref(false)

function openWithdrawModal() {
  showWithdrawModal.value = true
}

function closeWithdrawModal() {
  showWithdrawModal.value = false
}

async function withdrawUser() {
  withdrawError.value = '' // 기존 에러 초기화
  if (!withdrawPassword.value) {
    alert('비밀번호를 입력해주세요.')
    return
  }
  try {
    await userApi.withdraw({
      password: withdrawPassword.value
    })
    alert('회원 탈퇴가 완료되었습니다.')
    localStorage.removeItem('accessToken')
    window.location.href = '/'
  } catch (error) {
    console.error(error)
    withdrawError.value = '비밀번호가 올바르지 않습니다.'
  }
}

function openEditModal() {
  showEditModal.value = true
}

function openPasswordModal() {
  showPasswordModal.value = true
}

const statMap = computed(() => ({
  '내 게시글': myPosts.value.length,
  '내 댓글': myComments.value.length,
  '좋아요한 게시글': likedPosts.value.length,
  '좋아요한 댓글': likedComments.value.length,
}))

async function fetchAll() {
  try {
    const resUser = await userApi.getMyPage()
    user.value = resUser.data
    editForm.value.name = resUser.data.name
    editForm.value.phone = resUser.data.phone

    myPosts.value = (await userApi.getMyPosts()).data
    myComments.value = (await userApi.getMyComments()).data
    likedPosts.value = (await userApi.getMyLikedPosts()).data
    likedComments.value = (await userApi.getMyLikedComments()).data
  } catch {
    alert('데이터 로딩 실패')
  }
}

async function updateInfo() {
  try {
    await userApi.updateMyInfo(editForm.value)
    console.log(editForm.value)
    alert('정보가 수정되었습니다.')
    closeModal()
    fetchAll()
  } catch {
    alert('수정 실패')
  }
}
// 비밀번호 변경 폼 데이터
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 특수문자 정규식
const specialCharRegex = new RegExp(/[!@#$%^&*()_\-=\[\]{};':"\\|,.<>\/?]/)

// 비밀번호 강도 메시지
const passwordChangeStrengthMessage = computed(() => {
  const pwd = passwordForm.value.newPassword
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-zA-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (specialCharRegex.test(pwd)) score++

  if (!pwd) return ''
  if (score <= 2) return '비밀번호가 너무 약해요'
  if (score === 3) return '적절한 비밀번호예요'
  return '강력한 비밀번호입니다!'
})

const passwordChangeStrengthClass = computed(() => {
  const msg = passwordChangeStrengthMessage.value
  if (msg.includes('약')) return 'weak'
  if (msg.includes('적절')) return 'medium'
  if (msg.includes('강력')) return 'strong'
  return ''
})

// 비밀번호 일치 여부
const passwordsMatch = computed(() => {
  return (
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  )
})

const passwordMismatchMessage = computed(() => {
  if (!passwordForm.value.confirmPassword) return ''
  if (passwordsMatch.value) return ''
  return '새 비밀번호와 확인이 일치하지 않습니다.'
})

// 폼 전체 유효성 검사
const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordsMatch.value &&
    passwordChangeStrengthMessage.value !== '비밀번호가 너무 약해요'
  )
})
function closePasswordModal() {
  showPasswordModal.value = false
  passwordForm.value.currentPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
}
// 비밀번호 변경 API 호출
async function updatePassword() {
  if (!passwordsMatch.value) {
    alert('새 비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    await userApi.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    alert('비밀번호가 변경되었습니다.')
    closePasswordModal()
  } catch {
    alert('비밀번호 변경 실패')
  }
}

function closeModal() {
  showEditModal.value = false
}

onMounted(async () => {
  if (localStorage.getItem('accessToken')) {
    await fetchAll()
  }
})
</script>


<style scoped>
.no-underline {
  text-decoration: none;
  font-weight: bold;
}

.custom-modal-content .form-label {
  color: #333; /* 또는 black */
  font-weight: bold;
}
.nav-tabs .nav-link {
  color: white; /* 기본 탭 글씨색 */
}

.nav-tabs .nav-link.active {
  color: black; /* 선택된 탭은 검정 (또는 원하는 색) */
  background-color: white; /* 선택된 탭 배경 */
}
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

.password-strength.weak {
  color: #f87171; /* 빨강 */
}

.password-strength.medium {
  color: #facc15; /* 노랑 */
}

.password-strength.strong {
  color: #4ade80; /* 초록 */
}
.text-danger {
  color: #f87171;
  font-weight: bold;
}
</style>
