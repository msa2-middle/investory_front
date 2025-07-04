<!-- 성장성비율  -->
<template>
  <div class="growth-ratio">
    <h2>🚀 성장성 비율</h2>

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
            <th>
              <TooltipHeader
                label="결산<br />년월"
                desc="해당 항목이 기준하는 회계 연도 및 월입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="매출액<br />증가율"
                desc="전년도 대비 매출액이 얼마나 증가했는지를 나타냅니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="영업 이익<br />증가율"
                desc="전년도 대비 영업 이익(주된 사업의 수익성)의 증가율입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="자기자본<br />증가율"
                desc="전년도 대비 자기자본(자산 - 부채)의 증가율입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="총자산<br />증가율"
                desc="회사의 총자산이 전년도보다 얼마나 증가했는지를 보여줍니다."
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredRatios" :key="item.stacYymm">
            <td>{{ item.stacYymm }}</td>
            <td>{{ item.grs }}</td>
            <td>{{ item.bsopPrfiInrt }}</td>
            <td>{{ item.equtInrt }}</td>
            <td>{{ item.totlAsetInrt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>성장성 비율 데이터를 불러오지 못했습니다.</p>
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
const ratios = ref([])
const selectedYymm = ref('')

const filteredRatios = computed(() =>
  selectedYymm.value ? ratios.value.filter((r) => r.stacYymm === selectedYymm.value) : ratios.value,
)

const chartData = computed(() => {
  if (ratios.value.length === 0) return null

  return {
    labels: ratios.value.map((r) => r.stacYymm),
    datasets: [
      {
        label: '매출액 증가율',
        data: ratios.value.map((r) => Number(r.grs)),
        backgroundColor: '#3b82f6',
      },
      {
        label: '영업 이익 증가율',
        data: ratios.value.map((r) => Number(r.bsopPrfiInrt)),
        backgroundColor: '#f87171',
      },
      {
        label: '자기자본 증가율',
        data: ratios.value.map((r) => Number(r.equtInrt)),
        backgroundColor: '#10b981',
      },
      {
        label: '총자산 증가율',
        data: ratios.value.map((r) => Number(r.totlAsetInrt)),
        backgroundColor: '#fbbf24',
      },
    ],
  }
})

async function fetchGrowthRatios() {
  try {
    const response = await stockApi.getGrowthRatio(route.params.stockId)
    ratios.value = response.data
  } catch (error) {
    console.error('성장성 비율 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchGrowthRatios)
</script>

<style scoped>
.growth-ratio {
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
