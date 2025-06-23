<template>
  <div id="app">
    <StockHeader />
    <main class="main-content">
      <div class="content-layout">
        <StockRealtimeChart />
        <StockRight />
      </div>
    </main>
  </div>
</template>

<script>
import StockHeader from './components/StockHeader.vue'
import StockRealtimeChart from './components/StockRealtimeChart.vue'
import StockRight from './components/StockRight.vue'

export default {
  name: 'App',
  components: {
    StockHeader,
    StockRealtimeChart,
    StockRight
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  background-attachment: fixed;
}

.main-content {
  min-height: calc(100vh - 60px);
  padding: 0;
}

.content-layout {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  gap: 20px;
  padding: 0 20px;
}

.content-layout > :first-child {
  flex: 1;
}

.content-layout > :last-child {
  flex: 0 0 300px;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

/* 전역 버튼 스타일 */
button {
  outline: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

/* 전역 링크 스타일 */
a {
  text-decoration: none;
  color: inherit;
}

/* 반응형 유틸리티 클래스 */
@media (max-width: 1200px) {
  .content-layout {
    flex-direction: column;
  }

  .content-layout > :last-child {
    flex: 1;
  }

  .main-content {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 12px;
  }
}

/* 애니메이션 클래스 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 로딩 스피너 */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 토스트 메시지 스타일 */
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #1f2937;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.toast.show {
  transform: translateX(0);
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1f2937;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

/* 포커스 스타일 */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 선택 텍스트 스타일 */
::selection {
  background: #3b82f6;
  color: white;
}

::-moz-selection {
  background: #3b82f6;
  color: white;
}
</style>
