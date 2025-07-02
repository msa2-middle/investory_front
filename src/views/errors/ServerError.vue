<template>
  <div class="error-container">
    <div class="error-content">
      <h1>500</h1>
      <h2>문제가 발생했어요</h2>
      <p>서버에 문제가 생겼어요. 불편을 드려 죄송합니다.</p>
      <router-link to="/" class="home-btn">홈으로 돌아가기</router-link>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fefefe;
}

.error-content {
  text-align: center;
  color: #1f2937;
}

h1 {
  font-size: 6rem;
  margin-bottom: 0.5rem;
  color: #ef4444;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.home-btn {
  display: inline-block;
  background-color: #3182f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.home-btn:hover {
  background-color: #2563eb;
}
</style>
