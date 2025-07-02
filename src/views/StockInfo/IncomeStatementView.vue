<template>
  <div class="income-statement">
    <h2>📊 손익계산서</h2>

    <div v-if="loading" class="loading">데이터를 불러오는 중...</div>

    <div v-else-if="statements.length > 0">
      <!-- ✅ 분기 선택 -->
      <label>
        분기 선택:
        <select v-model="selectedYymm">
          <option value="">전체 보기</option>
          <option v-for="s in statements" :key="s.stacYymm" :value="s.stacYymm">
            {{ s.stacYymm }}
          </option>
        </select>
      </label>

      <!-- ✅ 차트 -->
      <BarChart v-if="chartData" :chart-data="chartData" />

      <!-- ✅ 테이블 -->
      <table>
        <thead>
          <tr>
            <th>
              <TooltipHeader
                label="결산<br />년월"
                desc="해당 손익계산서가 기준하는 회계 연도 및 월입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="매출액"
                desc="회사가 제품이나 서비스를 판매하여 벌어들인 총 수익입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="영업<br />이익"
                desc="매출에서 매출원가와 판매·관리비 등을 제외한 실제 영업 성과입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="당기<br />순이익"
                desc="영업이익에서 이자, 법인세 등을 모두 반영한 최종 순이익입니다."
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredStatements" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.saleAccount }}</td>
            <td>{{ item.bsopPrti }}</td>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'
import BarChart from '@/components/BarChart.vue'
import TooltipHeader from '@/components/TooltipHeader.vue'

const route = useRoute()
const loading = ref(true)
const statements = ref([])
const selectedYymm = ref('')

const filteredStatements = computed(() => {
  return selectedYymm.value
    ? statements.value.filter((s) => s.stacYymm === selectedYymm.value)
    : statements.value
})

const chartData = computed(() => {
  if (statements.value.length === 0) return null

  return {
    labels: statements.value.map((s) => s.stacYymm),
    datasets: [
      {
        label: '매출액',
        data: statements.value.map((s) => Number(s.saleAccount)),
        backgroundColor: '#60a5fa',
      },
      {
        label: '영업이익',
        data: statements.value.map((s) => Number(s.bsopPrti)),
        backgroundColor: '#34d399',
      },
      {
        label: '당기순이익',
        data: statements.value.map((s) => Number(s.thtrNtin)),
        backgroundColor: '#f87171',
      },
    ],
  }
})

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
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background: #f9fafb;
  color: #1f2937;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
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
