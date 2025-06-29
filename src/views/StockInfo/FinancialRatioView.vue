<template>
  <div class="financial-ratio">
    <h2>📈 재무 비율</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

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

      <!-- ✅ 테이블 -->
      <table>
        <thead>
          <tr>
            <th>결산 년월</th>
            <th>매출액 증가율</th>
            <th>영업 이익 증가율</th>
            <th>순이익 증가율</th>
            <th>ROE</th>
            <th>EPS</th>
            <th>SPS</th>
            <th>BPS</th>
            <th>유보 비율</th>
            <th>부채 비율</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredRatios" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.grs }}</td>
            <td>{{ item.bsopPrfiInrt }}</td>
            <td>{{ item.ntinInrt }}</td>
            <td>{{ item.roeVal }}</td>
            <td>{{ item.eps }}</td>
            <td>{{ item.sps }}</td>
            <td>{{ item.bps }}</td>
            <td>{{ item.rsrvRate }}</td>
            <td>{{ item.lbltRate }}</td>
          </tr>
        </tbody>
      </table>
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
}

.filter-label {
  font-weight: 600;
  margin-bottom: 12px;
  display: inline-block;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

th {
  background-color: #e5e7eb;
}
</style>
