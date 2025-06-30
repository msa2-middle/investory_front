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

      <!-- ✅ 자산/부채/자본 시각화 -->
      <BarChart v-if="chartData" :chart-data="chartData" />

      <!-- ✅ 테이블 -->
      <table>
        <thead>
          <tr>
            <th>결산년월</th>
            <th>유동자산</th>
            <th>고정자산</th>
            <th>자산총계</th>
            <th>유동부채</th>
            <th>고정부채</th>
            <th>부채총계</th>
            <th>자본금</th>
            <th>자본잉여금</th>
            <th>이익잉여금</th>
            <th>자본총계</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sheet in filteredSheets" :key="sheet.stacYymm">
            <td>{{ sheet.stacYymm }}</td>
            <td>{{ sheet.cras }}</td>
            <td>{{ sheet.fxas }}</td>
            <td>{{ sheet.totalAset }}</td>
            <td>{{ sheet.flowLblt }}</td>
            <td>{{ sheet.fixLblt }}</td>
            <td>{{ sheet.totalLblt }}</td>
            <td>{{ sheet.cpfn }}</td>
            <td>{{ sheet.cfpSurp }}</td>
            <td>{{ sheet.prfiSurp }}</td>
            <td>{{ sheet.totalCptl }}</td>
          </tr>
        </tbody>
      </table>
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
  max-width: 1100px;
  margin: 50px auto;
  padding: 30px;
  background: #f8fafc;
  color: #111827;
  border-radius: 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

label {
  display: block;
  margin-bottom: 16px;
  font-weight: bold;
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
