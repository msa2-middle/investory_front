<template>
  <div class="redirect-page">
    <h2>소셜 로그인 처리 중...</h2>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  const token = route.query.token
  const userName = route.query.name  // 혹시 서버에서 이름도 넘겨주는 경우 대비 (없으면 생략 가능)

  if (token) {
    authStore.setToken(token)
    if (userName) {
      authStore.setUserName(userName)
      localStorage.setItem('userName', userName)
    }
    localStorage.setItem('accessToken', token)
    if (authStore.role === 'ADMIN') {
    router.push('/admin')
  } else {
    router.push('/')
  }
  } else {
    alert("소셜 로그인 실패")
    router.push('/login')
  }
})
</script>

<style scoped>
.redirect-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
}
</style>
