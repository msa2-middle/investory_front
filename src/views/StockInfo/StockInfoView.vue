<!--  2. 주식 기본 정보 -->
<template>
  <div class="stock-info">
    <h2>종목 기본 정보</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="stockInfo">
      <p><strong>종목코드:</strong> {{ stockInfo.pdno }}</p>
      <p><strong>종목명:</strong> {{ stockInfo.prdtName }}</p>
      <p><strong>영문명:</strong> {{ stockInfo.prdtEngName }}</p>
      <p><strong>시장ID:</strong> {{ stockInfo.mktId }}</p>
      <p><strong>상장주식수:</strong> {{ stockInfo.listgStk }}</p>
      <p><strong>시가총액:</strong> {{ stockInfo.cpta }}</p>
    </div>

    <div v-else>
      <p>데이터를 불러오지 못했습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'

const route = useRoute()
const stockInfo = ref(null)
const loading = ref(true)

async function fetchStockInfo() {
  try {
    const response = await stockApi.getStockInfo(route.params.stockId)
    stockInfo.value = response.data
  } catch (error) {
    console.error('종목 정보 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchStockInfo)
</script>

<style scoped>
.stock-info {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: #101522;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: left;
}
</style>
