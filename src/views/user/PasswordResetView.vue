<template>
  <div class="container py-5" style="max-width: 500px; color: white;">
    <h2 class="mb-4 text-center">비밀번호 재설정</h2>

    <!-- 단계에 따라 폼 전환 -->
    <div v-if="step === 1">
      <div class="mb-3">
        <label class="form-label">가입한 이메일</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>
      <button class="reset-btn" @click="sendCode">인증코드 전송</button>
    </div>

    <div v-if="step === 2">
      <div class="mb-3">
        <label class="form-label">이메일로 받은 인증코드</label>
        <input v-model="code" type="text" class="form-control" required />
      </div>
      <button class="reset-btn" @click="verifyCode">인증하기</button>
    </div>

    <div v-if="step === 3">
      <div class="mb-3">
        <label class="form-label">새 비밀번호</label>
        <input v-model="newPassword" type="password" class="form-control" required />
      </div>
      <button class="reset-btn" @click="resetPassword">비밀번호 변경</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import passwordResetApi from '@/api/passwordResetApi'

const router = useRouter()
const email = ref('')
const code = ref('')
const newPassword = ref('')
const step = ref(1)

async function sendCode() {
  try {
    await passwordResetApi.sendCode({ email: email.value })
    alert('인증코드가 전송되었습니다.')
    step.value = 2
  } catch (error) {
    const message = error.response?.data?.message || '이메일 전송 실패'
    alert(message)
  }
}

async function verifyCode() {
  try {
    await passwordResetApi.verifyCode({ email: email.value, code: code.value })
    alert('인증 성공! 새 비밀번호를 입력하세요.')
    step.value = 3
  } catch (error) {
    const message = error.response?.data?.message || '인증 실패'
    alert(message)
  }
}

async function resetPassword() {
  try {
    await passwordResetApi.resetPassword({ email: email.value, newPassword: newPassword.value })
    alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.')

    // 기존 토큰 삭제 (혹시 남아있을 토큰 삭제)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')

    router.push('/login')
  } catch (error) {
    const message = error.response?.data?.message || '비밀번호 변경 실패'
    alert(message)
  }
}
</script>

<style scoped>
.reset-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

</style>
