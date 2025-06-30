<template>
  <div class="stock-realtime-view">
    <!-- 헤더 -->
    <div class="header">
      <h2>일별 · 실시간 시세</h2>
      <button class="close-btn" @click="$router.go(-1)">×</button>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button class="tab active">실시간</button>
      <button class="tab">일별</button>
    </div>

    <!-- 연결 상태 -->
    <div class="connection-status">
      <div v-if="!connected" class="status disconnected">
        <span class="dot"></span>
        SSE 연결 중...
      </div>
      <div v-else class="status connected">
        <span class="dot"></span>
        실시간 연결됨
      </div>
    </div>

    <!-- 거래 내역 테이블 -->
    <div class="table-container">
      <table class="trade-table">
        <thead>
          <tr>
            <th>체결가</th>
            <th>체결량 (주)</th>
            <th>등락률</th>
            <th>거래량 (주)</th>
            <th>시간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(trade, index) in trades" :key="index" class="trade-row">
            <td class="price">{{ formatPrice(trade.tradePrice) }}원</td>
            <td class="volume" :class="getVolumeClass(trade.tradeVolume)">
              {{ formatVolume(trade.tradeVolume) }}
            </td>
            <td class="change-rate" :class="getChangeClass(trade.changeRate)">
              {{ formatChangeRate(trade.changeRate) }}
            </td>
            <td class="acc-volume">{{ formatNumber(trade.accumulateVolume) }}</td>
            <td class="time">{{ formatTime(trade.tradeTime) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 데이터가 없을 때 -->
      <div v-if="trades.length === 0" class="no-data">
        <p v-if="connected">데이터 수신 대기 중...</p>
        <p v-else>연결을 확인해주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const stockId = route.params.stockId

const connected = ref(false)
const trades = ref([])
let eventSource = null

// SSE 연결 설정
const connectSSE = () => {
  try {
    eventSource = new EventSource(`http://localhost:8091/stock/${stockId}/realTimeprice`)

    eventSource.addEventListener('open', () => {
      console.log('[SSE] 연결 시작')
    })

    eventSource.addEventListener('connected', (event) => {
      connected.value = true
      console.log(`[SSE] 연결 성공: ${event.data}`)
    })

    eventSource.addEventListener('priceUpdate', (event) => {
      try {
        const newTrade = JSON.parse(event.data)

        // 새 거래 데이터를 맨 앞에 추가 (최신 데이터가 위에 오도록)
        trades.value.unshift(newTrade)

        // 최대 50개 데이터만 유지 (성능 고려)
        if (trades.value.length > 50) {
          trades.value = trades.value.slice(0, 50)
        }

        console.log(`[SSE] 가격 갱신`, newTrade)
      } catch (error) {
        console.error('[SSE] 데이터 파싱 오류:', error)
      }
    })

    eventSource.addEventListener('error', (event) => {
      console.error('[SSE] 이벤트 오류:', event)
    })

    eventSource.onerror = (error) => {
      console.error('[SSE] 연결 오류:', error)
      connected.value = false

      // 재연결 시도 (5초 후)
      setTimeout(() => {
        if (!connected.value) {
          console.log('[SSE] 재연결 시도...')
          connectSSE()
        }
      }, 5000)
    }
  } catch (error) {
    console.error('[SSE] 연결 초기화 오류:', error)
  }
}

// 포맷팅 함수들
const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

const formatVolume = (volume) => {
  return new Intl.NumberFormat('ko-KR').format(volume)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const formatChangeRate = (rate) => {
  // 이미 퍼센트 문자열로 온 경우 (예: "3.17%", "-1.25%")
  if (typeof rate === 'string' && rate.includes('%')) {
    const numericValue = parseFloat(rate.replace('%', ''))
    if (!isNaN(numericValue)) {
      return `${numericValue > 0 ? '+' : ''}${rate}`
    }
    return rate
  }

  // 숫자로 온 경우 (예: 0.0317, -0.0125)
  if (typeof rate === 'number' && !isNaN(rate)) {
    return `${rate > 0 ? '+' : ''}${(rate * 100).toFixed(2)}%`
  }

  // 문자열 숫자로 온 경우 (예: "0.0317")
  if (typeof rate === 'string') {
    const numericValue = parseFloat(rate)
    if (!isNaN(numericValue)) {
      return `${numericValue > 0 ? '+' : ''}${(numericValue * 100).toFixed(2)}%`
    }
  }

  // 처리할 수 없는 경우
  return rate || '0.00%'
}

const formatTime = (timeString) => {
  // HHMMSS 형식을 HH:MM:SS로 변환
  if (timeString && timeString.length === 6) {
    return `${timeString.slice(0, 2)}:${timeString.slice(2, 4)}:${timeString.slice(4, 6)}`
  }
  return timeString
}

// 스타일 클래스 결정
const getChangeClass = (rate) => {
  let numericRate = 0

  // 이미 퍼센트 문자열로 온 경우 (예: "3.17%", "-1.25%")
  if (typeof rate === 'string' && rate.includes('%')) {
    numericRate = parseFloat(rate.replace('%', ''))
  }
  // 숫자로 온 경우
  else if (typeof rate === 'number') {
    numericRate = rate
  }
  // 문자열 숫자로 온 경우
  else if (typeof rate === 'string') {
    numericRate = parseFloat(rate)
  }

  if (numericRate > 0) return 'positive'
  if (numericRate < 0) return 'negative'
  return 'neutral'
}

const getVolumeClass = (volume) => {
  // 거래량에 따른 색상 구분 (예: 큰 거래량은 빨간색)
  if (volume >= 50) return 'high-volume'
  if (volume >= 20) return 'medium-volume'
  return 'low-volume'
}

onMounted(() => {
  connectSSE()
})

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
    console.log('[SSE] 연결 종료')
  }
})
</script>

<style scoped>
.stock-realtime-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Malgun Gothic', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #000;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.tab.active {
  color: #000;
  border-bottom: 2px solid #000;
  font-weight: bold;
}

.connection-status {
  margin-bottom: 15px;
}

.status {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 15px;
  width: fit-content;
}

.status.connected {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status.disconnected {
  background-color: #ffeaa7;
  color: #d63031;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.connected .dot {
  background-color: #4caf50;
}

.disconnected .dot {
  background-color: #ff9800;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  max-height: 600px;
  overflow-y: auto;
}

.trade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.trade-table th {
  background-color: #f5f5f5;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.trade-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.trade-row:hover {
  background-color: #f9f9f9;
}

.price {
  font-weight: bold;
  color: #333;
}

.volume.high-volume {
  color: #d32f2f;
  font-weight: bold;
}

.volume.medium-volume {
  color: #1976d2;
}

.volume.low-volume {
  color: #666;
}

.change-rate.positive {
  color: #d32f2f;
}

.change-rate.negative {
  color: #1976d2;
}

.change-rate.neutral {
  color: #666;
}

.acc-volume {
  color: #666;
}

.time {
  color: #888;
  font-size: 12px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-data p {
  margin: 0;
}

/* 스크롤바 스타일링 */
.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
