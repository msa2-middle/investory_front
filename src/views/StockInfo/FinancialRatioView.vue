<!-- 재무비율 -->
<template>
  <div class="financial-ratio">
    <h2>재무 비율</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="ratios.length > 0">
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
          <tr v-for="item in ratios" :key="item.stacYymm">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'

const route = useRoute()
const loading = ref(true)
const ratios = ref([])

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
  max-width: 1100px;
  margin: 40px auto;
  padding: 30px;
  background: #1d1e2f;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #555;
  padding: 10px;
  text-align: center;
}

th {
  background-color: #2c2f45;
  font-weight: bold;
}
</style>
