<template>
  <div class="stock-chart-container">
    <!-- 상단 시간 및 탭 영역 -->
    <div class="chart-header">
      <div class="time-info">
        <h2 class="time-title">실시간 차트</h2>
        <span class="current-time">어제 {{ currentTime }} 기준</span>
      </div>

      <div class="chart-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="chart-actions">
        <button class="action-btn">
          <span class="icon">📊</span>
          투자위험 주식 숨기기
        </button>
      </div>
    </div>

    <!-- 시간 필터 -->
    <div class="time-filter">
      <span class="filter-label">실시간</span>
      <div class="time-buttons">
        <button
          v-for="period in timePeriods"
          :key="period"
          :class="['time-btn', { active: activePeriod === period }]"
          @click="setActivePeriod(period)"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <!-- 주식 목록 -->
    <div class="stock-list">
      <div class="list-header">
        <div class="header-item">종목</div>
        <div class="header-item">현재가</div>
        <div class="header-item">등락률</div>
        <div class="header-item">거래대금 많은 순</div>
      </div>

      <div class="stock-items">
        <div
          v-for="(stock, index) in stockData"
          :key="stock.id"
          class="stock-item"
        >
          <div class="stock-rank">
            <button class="heart-btn">♡</button>
            <span class="rank">{{ index + 1 }}</span>
          </div>

          <div class="stock-info">
            <div class="stock-icon">
              <img :src="stock.icon" :alt="stock.name" />
            </div>
            <span class="stock-name">{{ stock.name }}</span>
          </div>

          <div class="stock-price">
            {{ formatPrice(stock.price) }}원
          </div>

          <div :class="['stock-change', getChangeClass(stock.change)]">
            {{ stock.change > 0 ? '+' : '' }}{{ stock.change }}%
          </div>

          <div class="stock-volume">
            {{ formatVolume(stock.volume) }}원
          </div>
        </div>
      </div>

      <!-- 더 보기 영역 -->
      <div class="load-more">
        <div class="notice">
          호재 최근 1년 사이 가장 높은 애널리스트 목표주가가 나왔어요. 📈
        </div>
        <div class="pagination">
          <button class="page-btn" v-for="page in 5" :key="page" :class="{ active: page === 1 }">
            {{ page }}
          </button>
          <span class="pagination-dots">...</span>
          <button class="page-btn">10</button>
          <button class="nav-btn">‹</button>
          <button class="nav-btn">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockRealtimeChart',
  data() {
    return {
      currentTime: '08:50',
      activeTab: 'domestic',
      activePeriod: '1일',
      tabs: [
        { id: 'domestic', name: '토스증권 거래대금' },
        { id: 'kospi', name: '토스증권 거래량' },
        { id: 'kosdaq', name: '거래대금' },
        { id: 'nasdaq', name: '거래량' },
        { id: 'sangseung', name: '급상승' },
        { id: 'geumhak', name: '급하락' },
        { id: 'ingi', name: '인기' }
      ],
      timePeriods: ['1일', '1주일', '1개월', '3개월', '6개월', '1년'],
      stockData: [
        {
          id: 1,
          name: '씨엠 인덱스그룹',
          price: 331490,
          change: 20.3,
          volume: 16900000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 2,
          name: '삼성전자',
          price: 59600,
          change: 0.6,
          volume: 41000000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 3,
          name: 'SQQQ',
          price: 31496,
          change: 1.4,
          volume: 31340000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 4,
          name: '아틀라시안',
          price: 261475,
          change: -3.3,
          volume: 29390000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 5,
          name: 'UVIX',
          price: 38697,
          change: 2.3,
          volume: 24980000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 6,
          name: '액센츄어',
          price: 393696,
          change: -6.8,
          volume: 24440000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 7,
          name: 'C3 AI',
          price: 32558,
          change: -2.3,
          volume: 18310000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 8,
          name: 'MUU',
          price: 34048,
          change: 2.8,
          volume: 16860000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 9,
          name: '로블록스',
          price: 140843,
          change: -0.5,
          volume: 14830000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 10,
          name: 'TSLL',
          price: 17051,
          change: -0.08,
          volume: 13490000000,
          icon: '/api/placeholder/24/24'
        },
        {
          id: 11,
          name: 'test',
          price: 11299,
          change: -0.09,
          volume: 13500000000,
          icon: '/api/placeholder/24/24'
        }
      ]
    }
  },
  methods: {
    setActiveTab(tabId) {
      this.activeTab = tabId;
    },
    setActivePeriod(period) {
      this.activePeriod = period;
    },
    formatPrice(price) {
      return price.toLocaleString();
    },
    formatVolume(volume) {
      if (volume >= 100000000000) {
        return (volume / 100000000000).toFixed(1) + '조';
      } else if (volume >= 10000000000) {
        return Math.floor(volume / 10000000000) + ',' + String(Math.floor((volume % 10000000000) / 100000000)).padStart(3, '0') + '억';
      } else if (volume >= 100000000) {
        return (volume / 100000000).toFixed(0) + '억';
      }
      return volume.toLocaleString();
    },
    getChangeClass(change) {
      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return 'neutral';
    }
  }
}
</script>

<style scoped>
.stock-chart-container {
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  margin: 20px auto;
  max-width: 1200px;
  border-radius: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.current-time {
  font-size: 14px;
  color: #9ca3af;
}

.chart-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #4b5563;
  color: white;
}

.tab-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.chart-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #4b5563;
  color: white;
}

.time-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.filter-label {
  font-weight: 600;
  color: white;
}

.time-buttons {
  display: flex;
  gap: 8px;
}

.time-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.time-btn:hover {
  color: white;
  background: #374151;
}

.time-btn.active {
  color: #3b82f6;
  background: #1e3a8a20;
}

.stock-list {
  width: 100%;
}

.list-header {
  display: grid;
  grid-template-columns: 80px 200px 120px 120px 150px;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #374151;
  margin-bottom: 8px;
}

.header-item {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.stock-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-item {
  display: grid;
  grid-template-columns: 80px 200px 120px 120px 150px;
  gap: 16px;
  padding: 12px 0;
  align-items: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.stock-item:hover {
  background-color: #262626;
}

.stock-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heart-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
}

.heart-btn:hover {
  color: #ef4444;
}

.rank {
  font-weight: 600;
  color: white;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-icon img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.stock-name {
  font-weight: 500;
  color: white;
}

.stock-price {
  font-weight: 600;
  text-align: right;
}

.stock-change {
  font-weight: 600;
  text-align: right;
}

.stock-change.positive {
  color: #ef4444;
}

.stock-change.negative {
  color: #3b82f6;
}

.stock-change.neutral {
  color: #9ca3af;
}

.stock-volume {
  text-align: right;
  color: #9ca3af;
  font-size: 14px;
}

.load-more {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #374151;
}

.notice {
  background: #1e3a8a20;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 16px;
  color: #93c5fd;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.page-btn,
.nav-btn {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover,
.nav-btn:hover {
  border-color: #4b5563;
  color: white;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-dots {
  color: #6b7280;
  padding: 0 4px;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-tabs {
    width: 100%;
    justify-content: flex-start;
  }

  .list-header,
  .stock-item {
    grid-template-columns: 60px 1fr 80px 80px;
    gap: 8px;
  }

  .stock-volume {
    display: none;
  }

  .header-item:last-child {
    display: none;
  }
}
</style>
