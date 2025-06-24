<template>
  <div class="login-page">
    <div class="login-card">
      <h2>로그인</h2>
      <form @submit.prevent="login">
        <input type="email" v-model="form.email" placeholder="이메일" required />
        <input type="password" v-model="form.password" placeholder="비밀번호" required />
        <button type="submit" class="login-btn">로그인</button>
      </form>

      <div class="social-buttons">
        <button class="social google">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
          구글로 로그인
        </button>
        <button class="social naver">
          <img src="@/assets/icons/naver.png" alt="네이버" />
          네이버로 로그인
        </button>
        <button class="social kakao">
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" alt="Kakao" />
          카카오로 로그인
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import userApi from '@/api/userApi'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const form = ref({
      email: '',
      password: '',
    })

    const authStore = useAuthStore()
    const router = useRouter()

    async function login() {
      try {
        const response = await userApi.login(form.value)
        const token = response.data.accessToken
        authStore.setToken(token)
        alert('로그인 성공!')
        router.push('/mypage')
      } catch (error) {
        console.error('로그인 실패:', error)
        alert('로그인 실패')
      }
    }

    return { form, login }
  },
}
</script>

<style scoped>
.login-page {
  height: calc(100vh - 100px);
  padding-top: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: radial-gradient(circle at top, #0f1624, #000000 80%);
}

.login-card {
  background-color: #101522;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  color: #ffffff;
  text-align: center;
}

.login-card h2 {
  margin-bottom: 30px;
  font-size: 28px;
}

.login-card input {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  background: #1c2230;
  color: #ffffff;
  font-size: 16px;
}

.login-card input::placeholder {
  color: #bbbbbb;
}

.login-btn {
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

.login-btn:hover {
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
