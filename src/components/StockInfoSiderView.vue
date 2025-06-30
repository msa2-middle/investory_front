<template>
  <aside class="stock-info-sidebar">
    <h3 class="sidebar-title">종목 정보</h3>
    <nav class="sidebar-nav">
      <router-link
        :to="`/stock/${stockId}/stock-info/product-info`"
        class="nav-item"
        :class="{ active: isActive('product-info') }"
      >
        <span class="nav-icon">📊</span>
        <span class="nav-text">종목 기본 정보</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/balance-sheet`"
        class="nav-item"
        :class="{ active: isActive('balance-sheet') }"
      >
        <span class="nav-icon">📋</span>
        <span class="nav-text">재무상태표</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/income-statement`"
        class="nav-item"
        :class="{ active: isActive('income-statement') }"
      >
        <span class="nav-icon">📈</span>
        <span class="nav-text">손익계산서</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/financial-ratio`"
        class="nav-item"
        :class="{ active: isActive('financial-ratio') }"
      >
        <span class="nav-icon">🔢</span>
        <span class="nav-text">재무비율</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/profitability-ratio`"
        class="nav-item"
        :class="{ active: isActive('profitability-ratio') }"
      >
        <span class="nav-icon">💰</span>
        <span class="nav-text">수익성비율</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/stability-ratio`"
        class="nav-item"
        :class="{ active: isActive('stability-ratio') }"
      >
        <span class="nav-icon">🛡️</span>
        <span class="nav-text">안정성비율</span>
      </router-link>

      <router-link
        :to="`/stock/${stockId}/stock-info/growth-ratio`"
        class="nav-item"
        :class="{ active: isActive('growth-ratio') }"
      >
        <span class="nav-icon">🚀</span>
        <span class="nav-text">성장성비율</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const stockId = route.params.stockId

function isActive(path) {
  return route.path.includes(path)
}
</script>

<style scoped>
.stock-info-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #1a1d29;
  border-radius: 12px;
  padding: 24px 0;
  height: fit-content;
  position: sticky;
  top: 120px; /* StockTabNav 높이 + 여유 공간 */
  border: 1px solid #2d3748;
}

.sidebar-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  padding: 0 24px;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #2d3748;
  color: #fff;
  border-left-color: #4a5568;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  color: #fff;
  border-left-color: #3b82f6;
  font-weight: 600;
}

.nav-item.active .nav-icon {
  filter: brightness(1.2);
}

.nav-icon {
  font-size: 1.1rem;
  width: 20px;
  display: flex;
  justify-content: center;
}

.nav-text {
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stock-info-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 20px;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 12px;
  }

  .nav-item {
    flex: 1;
    min-width: calc(50% - 4px);
    justify-content: center;
    padding: 8px 12px;
    border-radius: 8px;
    border-left: none;
    font-size: 0.85rem;
  }

  .nav-item.active {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  }
}
</style>
