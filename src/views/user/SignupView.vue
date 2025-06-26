<template>
  <div class="signup-page">
    <div class="signup-card">
      <h2>회원가입</h2>
      <form @submit.prevent="submitForm">
        <input type="email" v-model="form.email" placeholder="이메일" required />
        <input type="password" v-model="form.password" placeholder="비밀번호" required />

        <p class="password-strength" v-if="passwordTouched" :class="strengthClass">
          {{ strengthMessage }}
        </p>

        <input type="text" v-model="form.name" placeholder="이름" required />
        <input type="text" v-model="form.phone" placeholder="전화번호" />

        <button type="submit" class="signup-btn" :disabled="!isFormValid">회원가입</button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import userApi from '@/api/userApi'

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: '',
})

const passwordTouched = ref(false)
const specialCharRegex = new RegExp(/[!@#$%^&*()_\-=\[\]{};':"\\|,.<>\/?]/)

const strengthMessage = computed(() => {
  const pwd = form.value.password
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-zA-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (specialCharRegex.test(pwd)) score++

  if (score <= 2) return '비밀번호가 너무 약해요'
  if (score === 3) return '적절한 비밀번호예요'
  return '강력한 비밀번호입니다!'
})

const strengthClass = computed(() => {
  const msg = strengthMessage.value
  if (msg.includes('약')) return 'weak'
  if (msg.includes('적절')) return 'medium'
  return 'strong'
})

watchEffect(() => {
  if (form.value.password.length > 0) {
    passwordTouched.value = true
  }
})

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.name &&
    form.value.password &&
    strengthMessage.value !== '비밀번호가 너무 약해요'
  )
})

const router = useRouter()

async function submitForm() {
  try {
    await userApi.signup(form.value)
    alert('회원가입 성공!')
    router.push('/login')
  } catch (error) {
    console.error('회원가입 실패:', error)
    const message = error.response?.data?.message
    alert(`회원가입 실패: ${message || '알 수 없는 오류'}`)
  }
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
.password-strength {
  font-size: 13px;
  margin-top: -12px;
  margin-bottom: 16px;
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
.signup-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
