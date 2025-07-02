<template>
  <div class="admin-layout">
    <header class="admin-header">
      <router-link to="/admin" class="admin-title">
        Investory 관리자 센터
      </router-link>
      <div class="admin-user-info">
        <span class="admin-username">{{ authStore.userName }}</span>
        <button @click="logout">로그아웃</button>
      </div>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.clearToken()
  router.push('/login')
}

onMounted(() => {
  document.querySelector('#app').style.background = '#e9e9e9'
})

onBeforeUnmount(() => {
  document.querySelector('#app').style.background =
    'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
})
</script>

<style scoped>
/* Admin 전용 CSS 리셋 */
.admin-layout * {
  /*all: unset;*/
  box-sizing: border-box;
}

.admin-layout {
  font-family: sans-serif;
  color: #333333;
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  color: #333333;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.admin-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-username {
  font-weight: bold;
  color: #333333;
}

.admin-header button {
  background: #3b82f6;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.admin-header button:hover {
  background: #2563eb;
}
.admin-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  text-decoration: none;
}

.admin-title:hover {
  color: #3b82f6;
}
</style>

<style>
:global(html) :global(body) :global(#app) {
  background: #e9e9e9 !important;
}
</style>
