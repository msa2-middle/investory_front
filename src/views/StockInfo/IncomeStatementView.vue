<!-- 손익계산서 -->
<template>
  <div class="income-statement">
    <h2>손익계산서</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="statements.length > 0">
      <table>
        <thead>
          <tr>
            <th>결산 년월</th>
            <th>매출액</th>
            <th>매출 원가</th>
            <th>매출 총 이익</th>
            <th>감가상각비</th>
            <th>판매 및 관리비</th>
            <th>영업 이익</th>
            <th>영업 외 수익</th>
            <th>영업 외 비용</th>
            <th>경상 이익</th>
            <th>특별 이익</th>
            <th>특별 손실</th>
            <th>당기순이익</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in statements" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.saleAccount }}</td>
            <td>{{ item.saleCost }}</td>
            <td>{{ item.saleTotlPrfi }}</td>
            <td>{{ item.deprCost }}</td>
            <td>{{ item.sellMang }}</td>
            <td>{{ item.bsopPrti }}</td>
            <td>{{ item.bsopNonErnn }}</td>
            <td>{{ item.bsopNonExpn }}</td>
            <td>{{ item.opPrfi }}</td>
            <td>{{ item.specPrfi }}</td>
            <td>{{ item.specLoss }}</td>
            <td>{{ item.thtrNtin }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>손익계산서 데이터를 불러오지 못했습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'

const route = useRoute()
const loading = ref(true)
const statements = ref([])

async function fetchIncomeStatement() {
  try {
    const response = await stockApi.getIncomeStatement(route.params.stockId)
    statements.value = response.data
  } catch (error) {
    console.error('손익계산서 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchIncomeStatement)
</script>

<style scoped>
.income-statement {
  max-width: 1200px;
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
