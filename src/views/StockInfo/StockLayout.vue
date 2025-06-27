<template>
  <div>
    <StockTabNav />
    <div class="stock-layout-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import StockTabNav from '@/components/StockTabNav.vue'
</script>

<style scoped>
.stock-layout-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 0 20px; /* 좌우 패딩 추가 */
}

/* 종목정보 페이지는 별도 레이아웃을 가지므로 패딩 제거 */
.stock-layout-content :deep(.stock-info-container) {
  padding-top: 0;
}
</style>
