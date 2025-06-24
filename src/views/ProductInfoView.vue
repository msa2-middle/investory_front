<!--   1. 종목 기본 정보 -->
<template>
  <div class="product-info">
    <h2>상품 기본 정보</h2>

    <div v-if="loading">데이터를 불러오는 중...</div>

    <div v-else-if="productInfo">
      <p><strong>종목코드:</strong> {{ productInfo.pdno }}</p>
      <p><strong>종목명:</strong> {{ productInfo.prdtName }}</p>
      <p><strong>영문명:</strong> {{ productInfo.prdtEngName }}</p>
      <p><strong>약어명:</strong> {{ productInfo.prdtAbrvName }}</p>
      <p><strong>판매상태:</strong> {{ productInfo.prdtSaleStatCd }}</p>
      <p><strong>위험등급:</strong> {{ productInfo.prdtRiskGradCd }}</p>
      <p><strong>상품 분류:</strong> {{ productInfo.prdtClsfName }}</p>
      <p><strong>투자 유형:</strong> {{ productInfo.ivstPrdtTypeCdName }}</p>
      <p><strong>최초 등록일자:</strong> {{ productInfo.frstErlmDt }}</p>
    </div>

    <div v-else>
      <p>상품 정보를 불러오지 못했습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import stockApi from '@/api/stockApi'

const route = useRoute()
const productInfo = ref(null)
const loading = ref(true)

async function fetchProductInfo() {
  try {
    const response = await stockApi.getProductInfo(route.params.stockId)
    productInfo.value = response.data
  } catch (error) {
    console.error('상품 정보 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProductInfo)
</script>

<style scoped>
.product-info {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: #1a1a2e;
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: left;
}

.product-info p {
  margin: 8px 0;
}
</style>
