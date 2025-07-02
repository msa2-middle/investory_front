<template>
  <div class="product-info">
    <h2>📌 상품 기본 정보</h2>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p class="loading-text">불러오는 중입니다...</p>
    </div>

    <div v-else-if="productInfo" class="info-wrapper">
      <div class="info-row">
        <span class="label">종목코드</span>
        <span class="value">{{ productInfo.pdno }}</span>
      </div>
      <div class="info-row">
        <span class="label">종목명</span>
        <span class="value">{{ productInfo.prdtName }}</span>
      </div>
      <div class="info-row">
        <span class="label">영문명</span>
        <span class="value">{{ productInfo.prdtEngName }}</span>
      </div>
      <div class="info-row">
        <span class="label">약어명</span>
        <span class="value">{{ productInfo.prdtAbrvName }}</span>
      </div>
      <div class="info-row">
        <span class="label">판매상태</span>
        <span class="value">{{ productInfo.prdtSaleStatCd }}</span>
      </div>
      <div class="info-row">
        <span class="label">위험등급</span>
        <span class="value">{{ productInfo.prdtRiskGradCd }}</span>
      </div>
      <div class="info-row">
        <span class="label">상품 분류</span>
        <span class="value">{{ productInfo.prdtClsfName }}</span>
      </div>
      <div class="info-row">
        <span class="label">투자 유형</span>
        <span class="value">{{ productInfo.ivstPrdtTypeCdName }}</span>
      </div>
      <div class="info-row">
        <span class="label">최초 등록일자</span>
        <span class="value">{{ productInfo.frstErlmDt }}</span>
      </div>
    </div>

    <div v-else class="error-message">상품 정보를 불러오지 못했습니다.</div>
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
  max-width: 640px;
  margin: 40px auto;
  padding: 32px;
  border-radius: 16px;
  background: #f9fafc;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Spoqa Han Sans Neo', 'Pretendard', sans-serif;
  color: #1f2d3d;
}

h2 {
  font-size: 22px;
  margin-bottom: 24px;
  color: #1e1e1e;
}

.info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

.value {
  font-weight: 600;
  color: #111827;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
}

.loading-text {
  margin-top: 12px;
  font-size: 16px;
  color: #555;
}

.loader {
  width: 28px;
  height: 28px;
  border: 4px solid #ddd;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  font-size: 15px;
  color: #ef4444;
  padding: 20px 0;
}
</style>
