<template>
  <nav class="stock-tab-nav">
    <router-link
      :to="`/stock/${stockId}/price`"
      class="tab-btn"
      :class="{ active: isActive('price') }"
    >가격/호가</router-link>
    <router-link
      :to="`/stock/${stockId}/stock-info`"
      class="tab-btn"
      :class="{ active: isActive('stock-info') }"
    >종목정보</router-link>
    <router-link
      :to="`/stock/${stockId}/community`"
      class="tab-btn"
      :class="{ active: isActive('community') }"
    >커뮤니티</router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const stockId = route.params.stockId

function isActive(tab) {
  if (tab === 'price') return route.path.includes('/price')
  if (tab === 'stock-info') return route.path.includes('/stock-info')
  if (tab === 'community') return route.path.includes('/community')
  return false
}
</script>

<style scoped>
.stock-tab-nav {
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
  background: #181c2f;
  border-bottom: 2px solid #23263a;
  padding: 14px 0 6px 0;
  position: sticky;
  top: 60px;
  z-index: 10;
}
.tab-btn {
  color: #a0aec0;
  font-size: 0.98rem;
  font-weight: 600;
  text-decoration: none;
  padding: 7px 22px;
  border-radius: 999px;
  background: #23263a;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  border: none;
  outline: none;
  box-shadow: none;
  letter-spacing: 0.01em;
  margin-bottom: 2px;
}
.tab-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  box-shadow: 0 2px 8px rgba(59,130,246,0.10);
}
.tab-btn:hover:not(.active) {
  color: #fff;
  background: #374151;
}
</style>
