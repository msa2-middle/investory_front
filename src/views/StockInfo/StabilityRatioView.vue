<!-- 안정성비율  -->
<template>
  <div class="stability-ratio">
    <h2>안정성 비율</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="ratios.length > 0">
      <table>
        <thead>
          <tr>
            <th>결산 년월</th>
            <th>부채 비율</th>
            <th>차입금 의존도</th>
            <th>유동 비율</th>
            <th>당좌 비율</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ratios" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.lbltRate }}</td>
            <td>{{ item.bramDepn }}</td>
            <td>{{ item.crntRate }}</td>
            <td>{{ item.quckRate }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>안정성 비율 데이터를 불러오지 못했습니다.</p>
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

async function fetchStabilityRatios() {
  try {
    const response = await stockApi.getStabilityRatio(route.params.stockId)
    ratios.value = response.data
  } catch (error) {
    console.error('안정성 비율 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchStabilityRatios)
</script>

<style scoped>
.stability-ratio {
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background: #1e1e2e;
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
