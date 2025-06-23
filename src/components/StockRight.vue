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
      <div
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

export default {
  name: 'StockRight',
  data() {
    return {
      activeFilter: '지수 · 환율',
      chartWidth: 80,
      chartHeight: 30,
      filters: ['지수 · 환율', '채권', '원자재'],
      indices: [
        {
          id: 1,
          name: '코스피',
          value: 3021.84,
          change: 44.1,
          changePercent: 1.4,
          changeType: 'value',
          chartData: this.generateRandomData(20, 1.1) // 상승 추세
        },
        {
          id: 2,
          name: '코스닥',
          value: 1377.00,
          change: -2.6,
          changePercent: -0.1,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.95) // 안정적
        },
        {
          id: 3,
          name: '코스피200',
          value: 1377.00,
          change: -2.6,
          changePercent: -0.1,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.95) // 안정적
        },

        {
          id: 4,
          name: '환율',
          value: 98.70,
          change: -0.2,
          changePercent: -0.2,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.92)
        },

      ]
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
      if (change > 0) return '#ef4444'; // 빨간색 (상승)
      if (change < 0) return '#3b82f6'; // 파란색 (하락)
      return '#9ca3af'; // 회색 (변동없음)
    },
    generateRandomData(points, trend = 1) {
      const data = [];
      let value = 50;

      for (let i = 0; i < points; i++) {
        value += (Math.random() - 0.5) * 10 * trend;
        value = Math.max(10, Math.min(90, value));
        data.push(value);
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
    }
  }
}
</script>
