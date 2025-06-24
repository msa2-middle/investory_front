<!-- 3. 재무상태표 -->
<template>
  <div class="balance-sheet">
    <h2>대차대조표</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="balanceSheets.length > 0">
      <table>
        <thead>
          <tr>
            <th>결산 년월</th>
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
          <tr v-for="sheet in balanceSheets" :key="sheet.stacYymm">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'

const route = useRoute()
const loading = ref(true)
const balanceSheets = ref([])

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
  max-width: 1000px;
  margin: 50px auto;
  padding: 30px;
  background: #1e1e2f;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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
  padding: 8px;
  text-align: center;
}

th {
  background-color: #333;
}
</style>
