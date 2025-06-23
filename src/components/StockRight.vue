<template>
  <div class="stock-right-container">
    <!-- 상단 필터 -->
    <div class="filter-tabs">
      <button
        v-for="filter in filters"
        :key="filter"
        :class="['filter-btn', { active: activeFilter === filter }]"
        @click="setActiveFilter(filter)"
      >
        {{ filter }}
      </button>
    </div>

    <!-- 지수 목록 -->
    <div class="indices-list">
      <div v-if="loading" class="loading-indicator">
        데이터 로딩 중...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="indices.length === 0" class="no-data">
        표시할 데이터가 없습니다.
      </div>

      <div v-else
        v-for="index in indices"
        :key="index.id"
        class="index-item"
      >
        <div class="index-header">
          <span class="index-name">{{ index.name }}</span>
        </div>

        <div class="index-content">
          <div class="index-info">
            <div class="index-value">{{ formatValue(index.value) }}</div>
            <div :class="['index-change', getChangeClass(index.change)]">
              {{ index.change > 0 ? '+' : '' }}{{ index.change }}{{ index.changeType === 'percent' ? '%' : '' }}
              <span class="change-percent" v-if="index.changePercent">
                ({{ index.changePercent > 0 ? '+' : '' }}{{ index.changePercent }}%)
              </span>
            </div>
          </div>

          <div class="chart-container">
            <svg class="mini-chart" :width="chartWidth" :height="chartHeight" viewBox="0 0 80 30">
              <polyline
                :points="generateChartPoints(index.chartData)"
                :stroke="getChartColor(index.change)"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 추가 정보 -->
    <div class="additional-info">
      <div class="info-item">
        <span class="info-label">호재</span>
        <span class="info-text">최근 1년 사이 가장 높은 애널리스트 목표주가가 나왔어요. 📈</span>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/StockRight.css';
import axios from 'axios';

export default {
  name: 'StockRight',
  data() {
    return {
      activeFilter: '지수 · 환율',
      chartWidth: 80,
      chartHeight: 30,
      filters: ['지수 · 환율', '채권', '원자재'],
      indices: [],
      loading: false,
      error: null
    }
  },
  methods: {
    setActiveFilter(filter) {
      this.activeFilter = filter;
    },
    formatValue(value) {
      if (value >= 1000) {
        return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
      }
      return value.toFixed(2);
    },
    getChangeClass(change) {
      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return 'neutral';
    },
    getChartColor(change) {
      if (change > 0) return '#ef4444';
      if (change < 0) return '#3b82f6';
      return '#9ca3af';
    },
    safeParseFloat(value, defaultValue = 0) {
      if (value === null || value === undefined) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },
    generateTrendData(baseValue, points, trend = 1) {
      const data = [baseValue];
      for (let i = 1; i < points; i++) {
        const change = (Math.random() - 0.5) * trend * 2;
        data.push(Math.max(0, data[i-1] + change));
      }
      return data;
    },
    generateChartPoints(data) {
      if (!data || data.length === 0) return '';
      const width = this.chartWidth;
      const height = this.chartHeight;
      const stepX = width / (data.length - 1);
      const minValue = Math.min(...data);
      const maxValue = Math.max(...data);
      const range = maxValue - minValue || 1;
      return data.map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - minValue) / range) * height;
        return `${x},${y}`;
      }).join(' ');
    },
    async fetchIndices() {
      this.loading = true;
      this.error = null;

      try {
        const [kospiRes, kosdaqRes, kospi200Res] = await Promise.all([
          axios.get('/main/kospi'),
          axios.get('/main/kosdaq'),
          axios.get('/main/kospi200')
        ]);

        // 데이터 매핑 함수
        const mapData = (res, defaultName, id) => {
          const data = res.data?.[0] || {};
          const value = this.safeParseFloat(data.bstp_nmix_prpr);
          const change = this.safeParseFloat(data.bstp_nmix_prdy_vrss);
          const changePercent = this.safeParseFloat(data.bstp_nmix_prdy_ctrt);

          return {
            id: id,
            name: data.hts_kor_isnm || defaultName,
            value: value,
            change: change,
            changePercent: changePercent,
            changeType: 'value',
            chartData: this.generateTrendData(value, 20, change > 0 ? 1.1 : 0.9)
          };
        };

        this.indices = [
          mapData(kospiRes, '코스피', 1),
          mapData(kosdaqRes, '코스닥', 2),
          mapData(kospi200Res, '코스피200', 3)
        ];
      } catch (error) {
        this.error = '지수 데이터를 불러오는데 실패했습니다.';
        console.error('지수 데이터 불러오기 실패:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchIndices();
  }
}
</script>
