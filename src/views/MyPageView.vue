<template>
  <div class="mypage">
    <h2>마이페이지</h2>

    <div v-if="user">
      <p><strong>이메일:</strong> {{ user.email }}</p>
      <p><strong>이름:</strong> {{ user.name }}</p>
    </div>

    <div v-else>
      <p>불러오는 중...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import userApi from '@/api/userApi'

export default {
  setup() {
    const user = ref(null)

    async function fetchMyPage() {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('로그인이 필요합니다!')
        // router.push('/login') 도 가능
        return
      }

      try {
        const response = await userApi.getMyPage()
        user.value = response.data
      } catch (error) {
        console.error('마이페이지 조회 실패:', error)
        alert('로그인 정보가 유효하지 않습니다. 다시 로그인 해주세요.')
        // 로그인 페이지로 이동 처리 예정
      }
    }

    onMounted(() => {
      fetchMyPage()
    })

    return { user }
  },
}
</script>

<style scoped>
.mypage {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: #101522;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
</style>
