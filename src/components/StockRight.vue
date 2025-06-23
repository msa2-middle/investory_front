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
          name: '나스닥',
          value: 19447.41,
          change: -98.86,
          changePercent: -0.5,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.8) // 하락 추세
        },
        {
          id: 2,
          name: 'S&P 500',
          value: 5967.84,
          change: -13.03,
          changePercent: -0.2,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.9) // 약간 하락
        },
        {
          id: 3,
          name: 'VIX',
          value: 20.62,
          change: -1.55,
          changePercent: -6.9,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.7) // 변동성
        },
        {
          id: 4,
          name: '원달러',
          value: 1377.00,
          change: -2.6,
          changePercent: -0.1,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.95) // 안정적
        },
        {
          id: 5,
          name: '달러 인덱스',
          value: 98.70,
          change: -0.2,
          changePercent: -0.2,
          changeType: 'value',
          chartData: this.generateRandomData(20, 0.92)
        },
        {
          id: 6,
          name: '코스피',
          value: 3021.84,
          change: 44.1,
          changePercent: 1.4,
          changeType: 'value',
          chartData: this.generateRandomData(20, 1.1) // 상승 추세
        },
        {
          id: 7,
          name: '코스닥',
          value: 791.53,
          change: 9.02,
          changePercent: 1.1,
          changeType: 'value',
          chartData: this.generateRandomData(20, 1.05) // 약간 상승
        }
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

<style scoped>
.stock-right-container {
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  margin: 20px 0;
  border-radius: 12px;
  width: 300px;
  height: fit-content;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #374151;
  padding-bottom: 12px;
}

.filter-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: white;
  background: #374151;
}

.filter-btn.active {
  color: white;
  background: #374151;
}

.indices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.index-item {
  padding: 12px 0;
  border-bottom: 1px solid #2d2d2d;
}

.index-item:last-child {
  border-bottom: none;
}

.index-header {
  margin-bottom: 8px;
}

.index-name {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.index-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.index-info {
  flex: 1;
}

.index-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.index-change {
  font-size: 12px;
  font-weight: 500;
}

.index-change.positive {
  color: #ef4444;
}

.index-change.negative {
  color: #3b82f6;
}

.index-change.neutral {
  color: #9ca3af;
}

.change-percent {
  margin-left: 4px;
}

.chart-container {
  width: 80px;
  height: 30px;
  display: flex;
  align-items: center;
}

.mini-chart {
  width: 100%;
  height: 100%;
}

.additional-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #374151;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 600;
}

.info-text {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .stock-right-container {
    width: 100%;
    margin: 20px 0 0 0;
  }

  .indices-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .index-item {
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 16px;
    border-bottom: 1px solid #374151;
  }
}

@media (max-width: 768px) {
  .stock-right-container {
    padding: 16px;
  }

  .indices-list {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: center;
  }
}
</style>
