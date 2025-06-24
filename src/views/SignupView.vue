<template>
  <div class="signup-page">
    <div class="signup-card">
      <h2>회원가입</h2>
      <form @submit.prevent="submitForm">
        <input type="email" v-model="form.email" placeholder="이메일" required />
        <input type="password" v-model="form.password" placeholder="비밀번호" required />
        <input type="text" v-model="form.name" placeholder="이름" required />
        <input type="text" v-model="form.phone" placeholder="전화번호" />

        <button type="submit" class="signup-btn">회원가입</button>
      </form>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '@/api/api'

export default {
  setup() {
    const form = ref({
      email: '',
      password: '',
      name: '',
      phone: '',
    })

    async function submitForm() {
      try {
        const response = await api.post('/users/signup', form.value)
        console.log('회원가입 성공:', response.data)
        alert('회원가입 성공!')
      } catch (error) {
        console.error('회원가입 실패:', error)
        alert('회원가입 실패')
      }
    }

    return { form, submitForm }
  },
}
</script>

<style scoped>
.signup-page {
  height: calc(100vh - 100px);
  padding-top: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: radial-gradient(circle at top, #0f1624, #000000 80%);
}

.signup-card {
  background-color: #101522;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  color: #ffffff;
  text-align: center;
}

.signup-card h2 {
  margin-bottom: 30px;
  font-size: 28px;
}

.signup-card input {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  background: #1c2230;
  color: #ffffff;
  font-size: 16px;
}

.signup-card input::placeholder {
  color: #bbbbbb;
}

.signup-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: 0.3s;
}

.signup-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.social img {
  width: 20px;
  height: 20px;
}

.google {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.naver {
  background: #03c75a;
  color: white;
}

.kakao {
  background: #fee500;
  color: #381e1f;
}
</style>
