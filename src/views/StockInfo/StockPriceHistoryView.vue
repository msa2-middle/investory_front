<template>
  <div class="stock-price-history-view">
    <h2>가격 히스토리: {{ stockId }}</h2>
    <div class="date-search-wrap">
      <span v-if="notFoundMsg" class="not-found-msg">{{ notFoundMsg }}</span>
    </div>
    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" style="color:red">{{ error }}</div>
    <div v-else>
      <LineChart :chartData="chartData" style="width:100%;max-width:1200px;height:400px;margin:0 auto 32px;" @point-click="onChartPointClick" />
      <div class="table-scroll-wrap" ref="tableWrapRef" @scroll="onTableScroll">
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>시가</th>
              <th>고가</th>
              <th>저가</th>
              <th>종가</th>
              <th>거래량</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleHistory" :key="item.id || item.date" :data-date="item.tradeDate">
              <td>{{ item.tradeDate }}</td>
              <td>{{ item.openPrice }}</td>
              <td>{{ item.highPrice }}</td>
              <td>{{ item.lowPrice }}</td>
              <td @click="onTableCellClick(item.tradeDate)" style="cursor:pointer;">{{ item.closePrice }}</td>
              <td @click="onTableCellClick(item.tradeDate)" style="cursor:pointer;">{{ item.volume }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="tableLoading" style="text-align:center;padding:8px;">불러오는 중...</div>
        <div v-if="visibleHistory.length === 0 && !loading">데이터가 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'
import LineChart from '@/components/LineChart.vue'

const route = useRoute()
const stockId = route.params.stockId
const history = ref([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const pageSize = 20
const visibleHistory = ref([])
const tableLoading = ref(false)
const searchDate = ref('')
const tableWrapRef = ref(null)
const notFoundMsg = ref('')
const scrolling = ref(false)

const chartData = computed(() => {
  const arr = [...history.value].reverse()
  const maxVolume = Math.max(...arr.map(item => item.volume))
  return {
    labels: arr.map(item => item.tradeDate),
    datasets: [
      {
        label: '종가',
        data: arr.map(item => item.closePrice),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.2,
        fill: false,
        yAxisID: 'y',
        type: 'line',
      },
      {
        label: '거래량',
        data: arr.map(item => item.volume),
        backgroundColor: 'rgba(139, 92, 246, 0.18)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        yAxisID: 'y2',
        type: 'bar',
        order: 2,
        barPercentage: 0.4,
        categoryPercentage: 0.4,
        barThickness: 6,
      },
    ],
    y2Max: maxVolume * 8,
  }
})

onMounted(async () => {
  try {
    const res = await stockApi.getStockPriceHistory(stockId)
    history.value = res.data
    visibleHistory.value = history.value.slice(0, pageSize)
  } catch {
    error.value = '가격 히스토리 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function loadMore() {
  if (tableLoading.value) return
  tableLoading.value = true
  setTimeout(() => {
    const next = page.value * pageSize
    visibleHistory.value = history.value.slice(0, next + pageSize)
    page.value++
    tableLoading.value = false
  }, 300)
}

function onTableScroll(e) {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    loadMore()
  }
}

async function scrollToDate() {
  notFoundMsg.value = ''
  if (!searchDate.value) return
  if (scrolling.value) return
  scrolling.value = true
  // 최신순(내림차순)에서 해당 날짜의 인덱스 찾기
  const idx = history.value.findIndex(item => item.tradeDate === searchDate.value)
  if (idx === -1) {
    notFoundMsg.value = '해당 날짜 데이터가 없습니다.'
    scrolling.value = false
    return
  }
  // visibleHistory에 없으면 한 번에 확장
  if (idx >= visibleHistory.value.length) {
    const newLen = Math.ceil((idx + 1) / pageSize) * pageSize
    visibleHistory.value = history.value.slice(0, newLen)
    page.value = Math.ceil(newLen / pageSize)
    await nextTick()
  }
  // 테이블에서 해당 행으로 스크롤
  const row = tableWrapRef.value.querySelector(`tr[data-date='${searchDate.value}']`)
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  scrolling.value = false
}

function onChartPointClick(date) {
  searchDate.value = date
  scrollToDate()
}

function onTableCellClick(date) {
  searchDate.value = date
  scrollToDate()
}
</script>

<style scoped>
.table-scroll-wrap {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid #23263a;
  background: #181c2f;
  box-shadow: 0 2px 12px rgba(24,28,47,0.08);
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #181c2f;
  color: #f3f6fa;
  font-size: 1rem;
}
th, td {
  padding: 10px 8px;
  text-align: center;
}
th {
  background: linear-gradient(90deg, #23263a 60%, #23263a 100%);
  color: #a0aec0;
  font-weight: 700;
  border-bottom: 2px solid #23263a;
  position: sticky;
  top: 0;
  z-index: 1;
}
td {
  border-bottom: 1px solid #23263a;
  color: #f3f6fa;
}
tr {
  transition: background 0.15s;
}
tbody tr:hover {
  background: #23263a;
}
.table-scroll-wrap::-webkit-scrollbar {
  width: 8px;
  background: #23263a;
}
.table-scroll-wrap::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 8px;
}
.date-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.date-search-wrap input[type="date"] {
  background: #23263a;
  color: #f3f6fa;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 6px 10px;
}
.not-found-msg {
  color: #ff7675;
  margin-left: 8px;
  font-size: 0.98rem;
}
</style>
