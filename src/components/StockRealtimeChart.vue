<template>
  <div class="stock-chart-container">
    <div class="chart-header">
      <div class="time-info">
        <h2 class="time-title">순위 차트</h2>
        <span class="current-time">현재 {{ currentTime }} 기준</span>
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
    </div>

    <div class="time-filter">
    </div>

    <div class="stock-list">
      <div class="list-header">
        <div class="header-item">순위</div>
        <div class="header-item">종목</div>
        <div class="header-item">현재가</div>
        <div class="header-item">등락률</div>
        <div class="header-item">거래대금</div>
        <div class="header-item">알림</div>
      </div>

      <div class="stock-items" :class="{ 'table-flash': tableFlash }">
        <div v-if="error" class="error-message">
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
            </div>
            <span
              class="stock-name-link"
              @click.stop="goToStockInfo(stock.code)"
            >
              {{ stock.name }}
            </span>
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

          <!-- 알림 설정 버튼 - 설정 여부에 따라 다른 버튼 표시 -->
          <div class="stock-alert">
            <!-- 설정이 없는 경우: 생성 버튼 -->
            <StockAlertButton
              v-if="!stockAlertSettings[stock.code]"
              @open="openCreateModal(stock)"
            />
            <!-- 설정이 있는 경우: 수정/삭제 버튼 -->
            <StockAlertManageButton
              v-else
              @modify="openEditModal(stock)"
              @delete="deleteStockAlert(stock.code)"
            />
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

    <!-- 생성 모달 -->
    <StockAlertModal
      :show="isCreateModalOpen"
      :stock-code="selectedStock?.code"
      @close="isCreateModalOpen = false"
      @save="createStockAlert"
    />

    <!-- 수정/삭제 모달 -->
    <StockAlertEditModal
      :show="isEditModalOpen"
      :stock-code="selectedStock?.code"
      :stock-id="selectedStock?.code"
      :current-setting="stockAlertSettings[selectedStock?.code]"
      @close="isEditModalOpen = false"
      @update="updateStockAlert"
      @delete="deleteStockAlert"
    />
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/StockRealtimeChart.css';
import StockAlertButton from '@/components/StockAlertButton.vue';
import StockAlertModal from '@/components/StockAlertModal.vue';
import StockAlertManageButton from '@/components/StockAlertManageButton.vue';
import StockAlertEditModal from '@/components/StockAlertEditModal.vue';
import alarmApi from '@/api/alarmApi.js'

export default {
  name: 'StockRealtimeChart',
  data() {
    return {
      currentTime: '',
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
      timer: null,
      dataTimer: null,
      tableFlash: false,

      // 알림 설정 관련
      stockAlertSettings: {}, // 각 주식별 알림 설정 저장 (key: stockCode, value: setting)
      isCreateModalOpen: false,
      isEditModalOpen: false,
      selectedStock: null, // 선택된 주식 전체 정보 저장
    };
  },
  components: {
    StockAlertButton,
    StockAlertModal,
    StockAlertManageButton,
    StockAlertEditModal
  },

  computed: {
    visiblePages() {
      const pages = [];
      if (this.totalPages <= 7) {
        for (let i = 2; i < this.totalPages; i++) pages.push(i);
        return pages;
      }
      const cur = this.currentPage + 1;
      let start = Math.max(2, cur - 2);
      let end = Math.min(this.totalPages - 1, cur + 2);
      if (cur <= 4) {
        start = 2;
        end = 5;
      }
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
    this.updateCurrentTime();
    this.timer = setInterval(this.updateCurrentTime, 60000);
    this.fetchStockData(this.activeTab, 0);
    this.startDataTimer();
    this.loadStockAlertSettings(); // 알림 설정 로드
  },

  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
    if (this.dataTimer) clearInterval(this.dataTimer);
  },

  methods: {
    updateCurrentTime() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${hh}:${mm}`;
    },

    startDataTimer() {
      if (this.dataTimer) clearInterval(this.dataTimer);
      this.dataTimer = setInterval(() => {
        this.fetchStockData(this.activeTab, this.currentPage);
      }, 5000);
    },

    async fetchStockData(tabId, page = 0) {
      this.isLoading = true;
      this.error = null;
      try {
        const baseUrl = 'http://localhost:8091/main';
        const response = await axios.get(`${baseUrl}/${tabId}?page=${page}`);
        this.stockData = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.currentPage = response.data.number || 0;
        this.pageSize = response.data.size || 10;

        // 데이터 변경 시마다 알림 설정 다시 로드
        await this.loadStockAlertSettings();

        this.tableFlash = false;
        this.$nextTick(() => {
          this.tableFlash = true;
          setTimeout(() => {
            this.tableFlash = false;
          }, 500);
        });
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
      this.startDataTimer();
    },

    setActivePeriod(period) {
      this.activePeriod = period;
    },

    formatPrice(price) {
      if (price === undefined || price === null) return '';
      return Number(price).toLocaleString();
    },

    formatVolume(volume) {
      if (volume === undefined || volume === null) return '';
      const numVolume = Number(volume);

      if (numVolume >= 1000000000000) {
        return (numVolume / 1000000000000).toFixed(1) + '조';
      } else if (numVolume >= 100000000) {
        return (numVolume / 100000000).toFixed(0) + '억';
      } else if (numVolume >= 10000) {
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
      this.startDataTimer();
    },

    // 현재 화면에 표시된 주식들의 알림 설정 조회
    async loadStockAlertSettings() {
      try {
        const stockCodes = this.stockData.map(stock => stock.code);
        const settings = {};

        // 각 주식별로 설정 조회
        for (const stockCode of stockCodes) {
          try {
            const response = await alarmApi.getUserStockSettings(stockCode);
            // API 응답의 data 속성에서 실제 설정값 추출
            if (response && response.data) {
              settings[stockCode] = response.data;
            } else if (response) {
              settings[stockCode] = response;
            }
          } catch (error) {
            // 설정이 없는 경우는 정상적인 상황이므로 무시
            if (error.response?.status !== 404) {
              console.warn(`주식 ${stockCode} 설정 조회 오류:`, error);
            }
          }
        }

        console.log('로드된 알림 설정들:', settings);
        this.stockAlertSettings = settings;
      } catch (error) {
        console.error('알림 설정 로드 오류:', error);
      }
    },

    // 알림 생성 모달 열기
    openCreateModal(stock) {
      console.log('생성 모달 열기:', stock);
      this.selectedStock = stock;
      this.isCreateModalOpen = true;
    },

    // 알림 수정 모달 열기
    openEditModal(stock) {
      console.log('수정 모달 열기:', stock);
      console.log('현재 설정:', this.stockAlertSettings[stock.code]);
      this.selectedStock = stock;
      this.isEditModalOpen = true;
    },

    // 주가 알림 생성
    async createStockAlert({ stockCode, targetPrice, condition }) {
      try {
        console.log('알림 생성 요청:', { stockCode, targetPrice, condition });

        const response = await alarmApi.createStockAlertSettings({
          stockId: stockCode,
          targetPrice,
          condition
        });

        console.log('생성 성공:', response);
        alert('알림이 저장되었습니다!');
        this.isCreateModalOpen = false;

        // 설정 목록 다시 로드
        await this.loadStockAlertSettings();
      } catch (error) {
        console.error('생성 실패:', error);
        alert(
          '저장 실패: ' +
          (error.response?.data?.message ?? '알 수 없는 오류가 발생했습니다.')
        );
      }
    },

    // 주가 알림 수정
    async updateStockAlert({ stockId, stockCode, targetPrice, condition }) {
      try {
        console.log('알림 수정 요청:', { stockId, stockCode, targetPrice, condition });

        const response = await alarmApi.updateStockAlertSettings(stockId || stockCode, {
          targetPrice,
          condition
        });

        console.log('수정 성공:', response);
        alert('알림이 수정되었습니다!');
        this.isEditModalOpen = false;

        // 설정 목록 다시 로드
        await this.loadStockAlertSettings();
      } catch (error) {
        console.error('수정 실패:', error);
        alert(
          '수정 실패: ' +
          (error.response?.data?.message ?? '알 수 없는 오류가 발생했습니다.')
        );
      }
    },

    // 주가 알림 삭제
    // StockRealtimeChart.vue의 deleteStockAlert 함수 수정
    async deleteStockAlert(stockCodeOrData) {
      try {
        // 문자열인 경우(직접 호출) 또는 객체인 경우(모달에서 호출) 처리
        const stockCode = typeof stockCodeOrData === 'string'
          ? stockCodeOrData
          : stockCodeOrData.stockCode || stockCodeOrData.stockId;

        console.log('알림 삭제 요청:', stockCode);

        // confirmed 플래그가 없고 직접 호출인 경우에만 확인 메시지 표시
        const isConfirmed = typeof stockCodeOrData === 'object' && stockCodeOrData.confirmed;

        if (!isConfirmed && typeof stockCodeOrData === 'string') {
          if (!confirm(`${stockCode} 주식의 알림 설정을 삭제하시겠습니까?`)) {
            return;
          }
        }

        const response = await alarmApi.deleteStockAlertSettings(stockCode);
        console.log('삭제 성공:', response);

        alert('알림이 삭제되었습니다!');
        this.isEditModalOpen = false;

        // 설정 목록 다시 로드
        await this.loadStockAlertSettings();
      } catch (error) {
        console.error('삭제 실패:', error);
        alert(
          '삭제 실패: ' +
          (error.response?.data?.message ?? '알 수 없는 오류가 발생했습니다.')
        );
      }
    },

    // 주식 상세 페이지로 이동
    goToStockInfo(code) {
      this.$router.push(`/stock/${code}/stock-info`);
    }
  }
}
</script>

<style>
.table-flash {
  animation: table-flash-anim 0.5s;
}
@keyframes table-flash-anim {
  0% { background: #2a2a2a; }
  100% { background: transparent; }
}

.stock-name-link {
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.stock-name-link:hover {
  transform: translateY(-2px) scale(1.03);
  color: #3b82f6;
  text-decoration: underline;
}

.stock-name-link:active {
  transform: translateY(0) scale(0.98);
}
</style>
