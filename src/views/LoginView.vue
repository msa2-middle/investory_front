<template>
  <div class="container">
    <h1>로그인</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label>이메일</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>비밀번호</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">로그인</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

function handleLogin() {
  console.log('로그인 시도', email.value, password.value)
  // 추후 axios로 백엔드 로그인 연동할 예정
}
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
