<template>
  <div class="stock-price-view">
    <h2>실시간 가격: {{ stockId }}</h2>

    <div v-if="!connected" style="color: gray">SSE 연결 중...</div>
    <div v-if="connected && !priceInfo" style="color: gray">데이터 수신 대기 중...</div>

    <div v-if="priceInfo" class="price-box">
      <p><strong>현재가:</strong> {{ priceInfo.tradePrice }}원</p>
      <p><strong>등락율:</strong> {{ priceInfo.changeRate }}</p>
      <p><strong>체결량:</strong> {{ priceInfo.tradeVolume }}</p>
      <p><strong>누적거래량:</strong> {{ priceInfo.accumulateVolume }}</p>
      <p><strong>체결시간:</strong> {{ priceInfo.tradeTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const stockId = route.params.stockId

const connected = ref(false)
const priceInfo = ref(null)
let eventSource = null

onMounted(() => {
  eventSource = new EventSource(`http://localhost:8080/stock/${stockId}/realTimeprice`)

  eventSource.addEventListener('connected', (event) => {
    connected.value = true
    console.log(`[SSE] 연결 성공: ${event.data}`)
  })

  eventSource.addEventListener('priceUpdate', (event) => {
    priceInfo.value = JSON.parse(event.data)
    console.log(`[SSE] 가격 갱신`, priceInfo.value)
  })

  eventSource.onerror = (err) => {
    console.error('[SSE] 연결 오류:', err)
    connected.value = false
  }
})

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>

<style scoped>
.price-box {
  border: 1px solid #ccc;
  padding: 16px;
  margin-top: 16px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
