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
  padding: 32px 0 0 0;
}
</style>
