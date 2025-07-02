<!-- 안정성비율  -->
<template>
  <div class="stability-ratio">
    <h2>🛡️ 안정성 비율</h2>

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
                desc="해당 안정성 지표가 기준하는 회계 연도 및 월입니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="부채<br />비율"
                desc="자기자본 대비 부채의 비율입니다. 수치가 낮을수록 재무 건전성이 좋습니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="차입금<br />의존도"
                desc="총 자산 중에서 차입금이 차지하는 비율입니다. 외부자금 의존도를 보여줍니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="유동<br />비율"
                desc="단기 부채를 감당할 수 있는 유동자산의 비율입니다. 100% 이상이면 양호합니다."
              />
            </th>
            <th>
              <TooltipHeader
                label="당좌<br />비율"
                desc="유동자산 중에서도 당장 현금화 가능한 자산으로 단기부채를 감당할 수 있는 비율입니다."
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredRatios" :key="item.stacYymm">
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
        label: '부채 비율',
        data: ratios.value.map((r) => Number(r.lbltRate)),
        backgroundColor: '#3b82f6',
      },
      {
        label: '차입금 의존도',
        data: ratios.value.map((r) => Number(r.bramDepn)),
        backgroundColor: '#f87171',
      },
      {
        label: '유동 비율',
        data: ratios.value.map((r) => Number(r.crntRate)),
        backgroundColor: '#34d399',
      },
      {
        label: '당좌 비율',
        data: ratios.value.map((r) => Number(r.quckRate)),
        backgroundColor: '#facc15',
      },
    ],
  }
})

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
