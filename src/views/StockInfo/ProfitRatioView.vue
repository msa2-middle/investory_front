<!-- 수익성 비율 -->
<template>
  <div class="profit-ratio">
    <h2>💹 수익성 비율</h2>

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
            <th>총자본 순이익률</th>
            <th>자기자본 순이익률</th>
            <th>매출액 순이익률</th>
            <th>매출액 총이익률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredRatios" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.cptlNtinRate }}</td>
            <td>{{ item.selfCptlNtinInrt }}</td>
            <td>{{ item.saleNtinRate }}</td>
            <td>{{ item.saleTotlRate }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>수익성 비율 데이터를 불러오지 못했습니다.</p>
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
        label: '총자본 순이익률',
        data: ratios.value.map((r) => Number(r.cptlNtinRate)),
        backgroundColor: '#3b82f6',
      },
      {
        label: '자기자본 순이익률',
        data: ratios.value.map((r) => Number(r.selfCptlNtinInrt)),
        backgroundColor: '#f87171',
      },
      {
        label: '매출액 순이익률',
        data: ratios.value.map((r) => Number(r.saleNtinRate)),
        backgroundColor: '#34d399',
      },
      {
        label: '매출액 총이익률',
        data: ratios.value.map((r) => Number(r.saleTotlRate)),
        backgroundColor: '#fbbf24',
      },
    ],
  }
})

async function fetchProfitRatios() {
  try {
    const response = await stockApi.getProfitRatio(route.params.stockId)
    ratios.value = response.data
  } catch (error) {
    console.error('수익성 비율 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfitRatios)
</script>

<style scoped>
.profit-ratio {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: #f8fafc;
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
