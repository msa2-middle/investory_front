<template>
  <div class="stock-info-container">
    <StockInfoSiderView />
    <div class="stock-info-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import StockInfoSiderView from '@/components/StockInfoSiderView.vue'
</script>

<style scoped>
.stock-info-container {
  display: flex;
  gap: 24px;
  padding: 0; /* StockLayout에서 이미 패딩 처리됨 */
}

.stock-info-content {
  flex: 1;
  min-width: 0; /* flexbox overflow 방지 */
}
</style>
