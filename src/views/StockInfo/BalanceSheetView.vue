<template>
  <div class="balance-sheet">
    <h2>📘 대차대조표</h2>

    <div v-if="loading" class="loading">데이터를 불러오는 중...</div>

    <div v-else-if="balanceSheets.length > 0">
      <!-- ✅ 분기 선택 -->
      <label>
        분기 선택:
        <select v-model="selectedYymm">
          <option value="">전체 보기</option>
          <option v-for="sheet in balanceSheets" :key="sheet.stacYymm" :value="sheet.stacYymm">
            {{ sheet.stacYymm }}
          </option>
        </select>
      </label>

      <!-- ✅ 차트 위에 설명 툴팁 범례 추가
      <div class="chart-legend">
        <div class="legend-item" v-for="item in legendList" :key="item.label">
          <span class="color-box" :style="{ backgroundColor: item.color }"></span>
          <span class="tooltip-wrapper">
            {{ item.label }}
            <span class="tooltip">{{ item.description }}</span>
          </span>
        </div>
      </div> -->

      <!-- ✅ 자산/부채/자본 시각화 -->
      <BarChart v-if="chartData" :chart-data="chartData" />

      <!-- ✅ 테이블 (툴팁 포함) -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <TooltipHeader label="결산<br />년월" desc="해당 재무제표의 기준 연월입니다." />
              </th>
              <th>
                <TooltipHeader label="유동<br />자산" desc="1년 내 현금화 가능한 자산입니다." />
              </th>
              <th>
                <TooltipHeader label="고정<br />자산" desc="1년 이상 보유하는 장기 자산입니다." />
              </th>
              <th>
                <TooltipHeader label="자산<br />총계" desc="유동자산 + 고정자산의 총합입니다." />
              </th>
              <th>
                <TooltipHeader label="유동<br />부채" desc="1년 내 갚아야 할 부채입니다." />
              </th>
              <th>
                <TooltipHeader
                  label="고정<br />부채"
                  desc="1년 이상 장기적으로 갚아야 할 부채입니다."
                />
              </th>
              <th>
                <TooltipHeader label="부채<br />총계" desc="유동부채 + 고정부채의 총합입니다." />
              </th>
              <th>
                <TooltipHeader label="자본금" desc="회사가 설립 시 발행한 주식의 금액입니다." />
              </th>
              <th>
                <TooltipHeader
                  label="자본<br />잉여금"
                  desc="주식 발행가 - 액면가의 초과분입니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="이익<br />잉여금"
                  desc="누적된 순이익에서 배당 등을 제외한 금액입니다."
                />
              </th>
              <th>
                <TooltipHeader
                  label="자본<br />총계"
                  desc="회사의 순자산 총액입니다. (자산 - 부채)"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sheet in filteredSheets" :key="sheet.stacYymm">
              <td>{{ sheet.stacYymm }}</td>
              <td>{{ formatNumber(sheet.cras) }}</td>
              <td>{{ formatNumber(sheet.fxas) }}</td>
              <td>{{ formatNumber(sheet.totalAset) }}</td>
              <td>{{ formatNumber(sheet.flowLblt) }}</td>
              <td>{{ formatNumber(sheet.fixLblt) }}</td>
              <td>{{ formatNumber(sheet.totalLblt) }}</td>
              <td>{{ formatNumber(sheet.cpfn) }}</td>
              <td>{{ formatNumber(sheet.cfpSurp) }}</td>
              <td>{{ formatNumber(sheet.prfiSurp) }}</td>
              <td>{{ formatNumber(sheet.totalCptl) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <p>대차대조표 데이터를 불러오지 못했습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'
import BarChart from '@/components/BarChart.vue'
import TooltipHeader from '@/components/TooltipHeader.vue'

const route = useRoute()
const loading = ref(true)
const balanceSheets = ref([])
const selectedYymm = ref('')

const filteredSheets = computed(() => {
  return selectedYymm.value
    ? balanceSheets.value.filter((s) => s.stacYymm === selectedYymm.value)
    : balanceSheets.value
})

const chartData = computed(() => {
  if (balanceSheets.value.length === 0) return null

  return {
    labels: balanceSheets.value.map((s) => s.stacYymm),
    datasets: [
      {
        label: '자산총계',
        data: balanceSheets.value.map((s) => Number(s.totalAset)),
        backgroundColor: '#60a5fa',
      },
      {
        label: '부채총계',
        data: balanceSheets.value.map((s) => Number(s.totalLblt)),
        backgroundColor: '#f87171',
      },
      {
        label: '자본총계',
        data: balanceSheets.value.map((s) => Number(s.totalCptl)),
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

  // 억 단위로 변환 (한국 기준)
  if (num >= 100000000) {
    return Math.round(num / 100000000).toLocaleString() + '억'
  }
  // 만 단위로 변환
  else if (num >= 10000) {
    return Math.round(num / 10000).toLocaleString() + '만'
  }
  // 그 외는 일반 숫자
  return num.toLocaleString()
}

async function fetchBalanceSheet() {
  try {
    const response = await stockApi.getBalanceSheet(route.params.stockId)
    balanceSheets.value = response.data
  } catch (error) {
    console.error('대차대조표 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchBalanceSheet)
</script>

<style scoped>
.balance-sheet {
  max-width: 1200px; /* 너비 증가 */
  margin: 50px auto;
  padding: 30px;
  background: #f8fafc;
  color: #111827;
  border-radius: 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  overflow-x: auto; /* 가로 스크롤 추가 */
}

label {
  display: block;
  margin-bottom: 16px;
  font-weight: bold;
}

/* 테이블 컨테이너 */
.table-container {
  overflow-x: auto;
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  min-width: 1000px; /* 최소 너비 설정 */
  border-collapse: collapse;
  background: white;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 12px 8px;
  text-align: center;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  font-size: 14px;
}

th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 작은 헤더 텍스트 */
th {
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .balance-sheet {
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

/* 로딩 및 에러 상태 */
.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #6b7280;
}

/* 선택 박스 스타일 */
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

.chart-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  position: relative;
  cursor: help;
}

.color-box {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 2px;
  display: inline-block;
}

.tooltip-wrapper {
  position: relative;
}

.tooltip {
  visibility: hidden;
  background-color: #374151;
  color: #fff;
  text-align: center;
  padding: 6px 10px;
  border-radius: 6px;
  position: absolute;
  z-index: 100;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tooltip-wrapper:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>
