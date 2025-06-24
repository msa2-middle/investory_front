<template>
  <div class="stock-chart-container">
    <div class="chart-header">
      <div class="time-info">
        <h2 class="time-title">순위 차트</h2>
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

      <!-- <div class="chart-actions">
        <button class="action-btn">
          <span class="icon">📊</span>
          투자위험 주식 숨기기
        </button>
      </div> -->
    </div>

    <div class="time-filter">
      <!-- <span class="filter-label">실시간</span> -->
      <!-- <div class="time-buttons">
        <button
          v-for="period in timePeriods"
          :key="period"
          :class="['time-btn', { active: activePeriod === period }]"
          @click="setActivePeriod(period)"
        >
          {{ period }}
        </button>
      </div> -->
    </div>

    <div class="stock-list">
      <div class="list-header">
        <div class="header-item">순위</div>
        <div class="header-item">종목</div>
        <div class="header-item">현재가</div>
        <div class="header-item">등락률</div>
        <div class="header-item">거래대금</div>
      </div>

      <div class="stock-items">
        <div v-if="isLoading" class="loading-message">데이터를 불러오는 중입니다...</div>
        <div v-else-if="error" class="error-message">
          데이터를 불러오는데 실패했습니다: {{ error }}
        </div>
        <div v-else-if="stockData.length === 0" class="no-data-message">
          해당 랭킹 데이터가 없습니다.
        </div>
        <div
          v-for="(stock, index) in stockData"
          :key="stock.code"
          class="stock-item"
        >
          <div class="stock-rank">
            <button class="heart-btn">♡</button>
            <span class="rank">{{ index + 1 + currentPage * pageSize }}</span>
          </div>

          <div class="stock-info">
            <div class="stock-icon">
              <!-- <img src="/api/placeholder/24/24" :alt="stock.name" /> -->
            </div>
            <span class="stock-name">{{ stock.name }}</span>
          </div>

          <div class="stock-price">
            {{ formatPrice(stock.price) }}원
          </div>

          <div :class="['stock-change', getChangeClass(stock.chgrate)]">
            {{ stock.chgrate > 0 ? '+' : '' }}{{ Number(stock.chgrate).toFixed(2) }}%
          </div>

          <div class="stock-volume">
            {{ formatVolume(stock.trade_amt) }}원
          </div>
        </div>
      </div>

      <div class="load-more" v-if="totalPages > 1">
        <div class="pagination">
          <button class="nav-btn" :disabled="currentPage === 0" @click="goToPage(currentPage - 1)">‹</button>
          <button
            class="page-btn"
            :class="{ active: currentPage === 0 }"
            @click="goToPage(0)"
          >1</button>
          <span v-if="showLeftEllipsis" class="pagination-dots">...</span>
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page - 1 }"
            @click="goToPage(page - 1)"
          >
            {{ page }}
          </button>
          <span v-if="showRightEllipsis" class="pagination-dots">...</span>
          <button
            v-if="totalPages > 1"
            class="page-btn"
            :class="{ active: currentPage === totalPages - 1 }"
            @click="goToPage(totalPages - 1)"
          >
            {{ totalPages }}
          </button>
          <button class="nav-btn" :disabled="currentPage === totalPages - 1" @click="goToPage(currentPage + 1)">›</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import '../assets/StockRealtimeChart.css'; // <-- CSS 파일을 임포트합니다.

export default {
  name: 'StockRealtimeChart',
  data() {
    return {
      currentTime: '08:50',
      activeTab: 'volume-rank',
      activePeriod: '1일',
      tabs: [
        { id: 'volume-rank', name: '거래량' },
        { id: 'trading-value-rank', name: '거래대금' },
        { id: 'price-up-rank', name: '급상승' },
        { id: 'price-down-rank', name: '급하락' },
        { id: 'market-cap-rank', name: '시가총액' }
      ],
      timePeriods: ['1일', '1주일', '1개월', '3개월', '6개월', '1년'],
      stockData: [],
      isLoading: false,
      error: null,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    };
  },
  computed: {
    visiblePages() {
      // 항상 1, 마지막 페이지는 별도 표시. 중간만 반환
      const pages = [];
      if (this.totalPages <= 7) {
        // 전체 페이지가 7 이하라면 모두 표시
        for (let i = 2; i < this.totalPages; i++) pages.push(i);
        return pages;
      }
      // 현재 페이지(1-indexed)
      const cur = this.currentPage + 1;
      let start = Math.max(2, cur - 2);
      let end = Math.min(this.totalPages - 1, cur + 2);
      // 앞쪽이 부족하면 뒤쪽을 더 보여줌
      if (cur <= 4) {
        start = 2;
        end = 5;
      }
      // 뒤쪽이 부족하면 앞쪽을 더 보여줌
      if (cur >= this.totalPages - 3) {
        start = this.totalPages - 4;
        end = this.totalPages - 1;
      }
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    },
    showLeftEllipsis() {
      return this.totalPages > 7 && this.currentPage + 1 > 4;
    },
    showRightEllipsis() {
      return this.totalPages > 7 && this.currentPage + 1 < this.totalPages - 3;
    }
  },
  mounted() {
    this.fetchStockData(this.activeTab, 0);
  },
  methods: {
    async fetchStockData(tabId, page = 0) {
      this.isLoading = true;
      this.error = null;
      try {
        const baseUrl = 'http://localhost:8091/main'; // 또는 '/main' (프록시 설정에 따라)
        const response = await axios.get(`${baseUrl}/${tabId}?page=${page}`);
        this.stockData = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.currentPage = response.data.number || 0;
        this.pageSize = response.data.size || 10;
      } catch (err) {
        console.error('API 호출 오류:', err);
        this.error = '데이터를 불러오는데 실패했습니다.';
        this.stockData = [];
      } finally {
        this.isLoading = false;
      }
    },

    setActiveTab(tabId) {
      this.activeTab = tabId;
      this.fetchStockData(tabId, 0);
    },

    setActivePeriod(period) {
      this.activePeriod = period;
      // 시간 필터에 따른 데이터 변화 로직은 현재 API 설계에 없으므로,
      // 백엔드 API가 이 필터를 지원하도록 확장해야 합니다.
      // 예: this.fetchStockData(this.activeTab, period);
    },

    formatPrice(price) {
      if (price === undefined || price === null) return '';
      return Number(price).toLocaleString();
    },

    formatVolume(volume) {
      if (volume === undefined || volume === null) return '';
      const numVolume = Number(volume);

      if (numVolume >= 1000000000000) { // 1조 이상
        return (numVolume / 1000000000000).toFixed(1) + '조';
      } else if (numVolume >= 100000000) { // 1억 이상
        return (numVolume / 100000000).toFixed(0) + '억';
      } else if (numVolume >= 10000) { // 1만 이상
        return (numVolume / 10000).toFixed(0) + '만';
      }
      return numVolume.toLocaleString();
    },

    getChangeClass(chgrate) {
      if (chgrate === undefined || chgrate === null) return 'neutral';
      const numChgrate = Number(chgrate);
      if (numChgrate > 0) return 'positive';
      if (numChgrate < 0) return 'negative';
      return 'neutral';
    },

    goToPage(page) {
      if (page < 0 || page >= this.totalPages) return;
      this.fetchStockData(this.activeTab, page);
    }
  }
}
</script>
