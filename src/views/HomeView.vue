<script setup>
import StockRealtimeChart from '../components/StockRealtimeChart.vue'
import StockRight from '../components/StockRight.vue'
</script>

<template>
  <main class="main-content">
    <div class="content-layout">
      <StockRealtimeChart />
      <StockRight />
    </div>
  </main>
</template>

<style scoped>
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
</style>
