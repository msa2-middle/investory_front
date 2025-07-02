<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4">유저 상세 정보</h2>

    <div v-if="user" class="bg-white p-4 rounded">
      <div class="mb-3">
        <label class="form-label">이메일</label>
        <input type="email" class="form-control" v-model="user.email" readonly />
      </div>
      <div class="mb-3">
        <label class="form-label">이름</label>
        <input type="text" class="form-control" v-model="user.name" />
      </div>
      <div class="mb-3">
        <label class="form-label">전화번호</label>
        <input type="text" class="form-control" v-model="user.phone" />
      </div>
      <div class="mb-3">
        <label class="form-label">권한</label>
        <select class="form-select" v-model="user.role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">가입일</label>
        <input type="text" class="form-control" :value="formatDate(user.createdAt)" readonly />
      </div>
      <button class="btn btn-primary" @click="saveUser">저장</button>
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

const user = ref(null)

onMounted(async () => {
  try {
    const res = await adminApi.getUserById(route.params.id)
    user.value = res.data
  } catch (e) {
    console.error(e)
    alert('유저 정보를 불러오지 못했습니다.')
    router.push('/admin/users')
  }
})

async function saveUser() {
  try {
    await adminApi.updateUser(user.value.userId, {
      name: user.value.name,
      phone: user.value.phone,
      role: user.value.role,
    })
    alert('수정 완료!')
    router.push('/admin/users')
  } catch (e) {
    console.error(e)
    alert('수정 실패!')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString()
}
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
