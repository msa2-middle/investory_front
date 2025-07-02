<template>
  <div class="financial-ratio">
    <h2>📈 재무 비율</h2>

    <div v-if="loading" class="loading">데이터를 불러오는 중...</div>

    <div v-else-if="ratios.length > 0">
      <!-- ✅ 분기 선택 -->
      <label class="filter-label">
        분기 선택:
        <select v-model="selectedYymm">
          <option value="">전체 보기</option>
          <option v-for="item in ratios" :key="item.stacYymm" :value="item.stacYymm">
            {{ item.stacYymm }}
          </option>
        </select>
      </label>

      <!-- ✅ 차트 -->
      <BarChart v-if="chartData" :chart-data="chartData" />

      <!-- ✅ 테이블 컨테이너 -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <TooltipHeader label="결산<br />년월" desc="해당 재무비율의 기준 연월입니다." />
              </th>
              <th>
                <TooltipHeader
                  label="매출액<br />증가율"
                  desc="전년도 대비 매출액의 증가 비율입니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="영업이익<br />증가율"
                  desc="전년도 대비 영업이익의 증가 비율입니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="순이익<br />증가율"
                  desc="전년도 대비 순이익의 증가 비율입니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="ROE"
                  desc="자기자본 대비 순이익의 비율입니다. (수익성 지표)"
                />
              </th>
              <th>
                <TooltipHeader label="EPS" desc="1주당 순이익 (Earnings Per Share)을 의미합니다." />
              </th>
              <th>
                <TooltipHeader label="SPS" desc="1주당 매출액 (Sales Per Share)을 의미합니다." />
              </th>
              <th>
                <TooltipHeader
                  label="BPS"
                  desc="1주당 순자산 (Book-value Per Share)을 의미합니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="유보<br />비율"
                  desc="이익잉여금이 자본금 대비 얼마나 쌓였는지를 나타냅니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="부채<br />비율"
                  desc="자산 대비 부채의 비율입니다. 재무 건전성을 나타냅니다."
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRatios" :key="item.stacYymm">
              <td>{{ item.stacYymm }}</td>
              <td>{{ formatPercent(item.grs) }}</td>
              <td>{{ formatPercent(item.bsopPrfiInrt) }}</td>
              <td>{{ formatPercent(item.ntinInrt) }}</td>
              <td>{{ formatPercent(item.roeVal) }}</td>
              <td>{{ formatNumber(item.eps) }}</td>
              <td>{{ formatNumber(item.sps) }}</td>
              <td>{{ formatNumber(item.bps) }}</td>
              <td>{{ formatPercent(item.rsrvRate) }}</td>
              <td>{{ formatPercent(item.lbltRate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <p>재무 비율 데이터를 불러오지 못했습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'
import BarChart from '@/components/BarChart.vue'
import TooltipHeader from '@/components/TooltipHeader.vue'

const route = useRoute()
const loading = ref(true)
const ratios = ref([])
const selectedYymm = ref('')

const filteredRatios = computed(() => {
  return selectedYymm.value
    ? ratios.value.filter((r) => r.stacYymm === selectedYymm.value)
    : ratios.value
})

const chartData = computed(() => {
  if (ratios.value.length === 0) return null

  return {
    labels: ratios.value.map((r) => r.stacYymm),
    datasets: [
      {
        label: 'ROE',
        data: ratios.value.map((r) => Number(r.roeVal)),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'EPS',
        data: ratios.value.map((r) => Number(r.eps)),
        backgroundColor: '#f87171',
      },
      {
        label: '부채 비율',
        data: ratios.value.map((r) => Number(r.lbltRate)),
        backgroundColor: '#34d399',
      },
    ],
  }
})

// 숫자 포맷팅 함수
function formatNumber(value) {
  if (!value || value === '0') return '-'
  const num = Number(value)
  if (isNaN(num)) return value

  return num.toLocaleString()
}

// 퍼센트 포맷팅 함수
function formatPercent(value) {
  if (!value || value === '0') return '-'
  const num = Number(value)
  if (isNaN(num)) return value

  return num.toFixed(2) + '%'
}

async function fetchFinancialRatios() {
  try {
    const response = await stockApi.getFinancialRatio(route.params.stockId)
    ratios.value = response.data
  } catch (error) {
    console.error('재무 비율 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchFinancialRatios)
</script>

<style scoped>
.financial-ratio {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: #f9fafc;
  color: #1f2937;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.filter-label {
  font-weight: 600;
  margin-bottom: 16px;
  display: block;
}

select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  margin-left: 8px;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-container {
  overflow-x: auto;
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  background: white;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 12px 8px;
  text-align: center;
  white-space: nowrap;
  font-size: 14px;
}

th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 12px;
  line-height: 1.2;
}

/* 숫자 포맷팅 */
td:not(:first-child) {
  font-family: 'Courier New', monospace;
  text-align: right;
  padding-right: 12px;
}

/* 첫 번째 열 (날짜) 스타일 */
td:first-child {
  font-weight: 600;
  background-color: #f9fafb;
  position: sticky;
  left: 0;
  z-index: 5;
}

th:first-child {
  position: sticky;
  left: 0;
  z-index: 15;
  background-color: #f3f4f6;
}

/* 양수/음수 색상 구분 */
td:nth-child(2), /* 매출액 증가율 */
td:nth-child(3), /* 영업이익 증가율 */
td:nth-child(4), /* 순이익 증가율 */
td:nth-child(5)  /* ROE */ {
  color: #059669; /* 초록색 */
}

td:nth-child(2):has-text('-'),
td:nth-child(3):has-text('-'),
td:nth-child(4):has-text('-'),
td:nth-child(5):has-text('-') {
  color: #dc2626; /* 빨간색 */
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .financial-ratio {
    margin: 20px;
    padding: 20px;
  }

  th,
  td {
    padding: 8px 4px;
    font-size: 11px;
  }

  table {
    min-width: 800px;
  }
}

/* 로딩 스타일 */
.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #6b7280;
}
</style>
