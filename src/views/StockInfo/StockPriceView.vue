<template>
  <div class="stock-realtime-view">
    <!-- 헤더 -->
    <div class="header">
      <h2>실시간 시세</h2>
      <button class="close-btn" @click="$router.go(-1)">×</button>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button class="tab active">실시간</button>
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
    <div class="table-container" v-if="marketOpen">
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

    <!-- 장이 열려있지 않을 때 -->
    <div v-else class="market-closed">
      <p>⚠ 현재는 장 운영 시간이 아닙니다.</p>
      <p>실시간 체결 데이터는 오전 8시 ~ 오후 8시에만 제공됩니다.</p>
    </div>

    <!-- 디버깅 정보 (개발 시에만 표시) -->
    <div v-if="showDebugInfo" class="debug-info">
      <h4>디버그 정보</h4>
      <p>연결 상태: {{ connected }}</p>
      <p>장 상태: {{ marketOpen }}</p>
      <p>받은 데이터 수: {{ trades.length }}</p>
      <p>마지막 메시지: {{ lastMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

// 라우트에서 stockId 추출
const route = useRoute()
const stockId = route.params.stockId

// 상태 변수들
const trades = ref([])
const connected = ref(false)
const marketOpen = ref(true)
const showDebugInfo = ref(true) // 개발 시 디버깅용
const lastMessage = ref('')

let eventSource = null

// 장 운영 시간 체크 (08:00 ~ 20:00 KST)
function isMarketOpen() {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const hour = kst.getHours()
  const minute = kst.getMinutes()
  const totalMinutes = hour * 60 + minute

  // 8:00 ~ 20:00 (480분 ~ 1200분)
  return totalMinutes >= 480 && totalMinutes <= 1200
}

// SSE 연결 함수
function connectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  console.log(`[SSE] 연결 시도: stockId=${stockId}`)
  const url = `/stock/${stockId}/realTimeprice`

  try {
    eventSource = new EventSource(url)

    // 연결 성공
    eventSource.addEventListener('open', (event) => {
      console.log('[SSE] 연결 성공')
      connected.value = true
      lastMessage.value = '연결 성공'
    })

    // 메시지 수신 (기본 message 이벤트)
    eventSource.addEventListener('message', (event) => {
      console.log('[SSE] message 이벤트:', event.data)
      lastMessage.value = `message: ${event.data}`
      handleMessage(event.data)
    })

    // trade 이벤트 수신 (백엔드에서 보내는 사용자 정의 이벤트)
    eventSource.addEventListener('trade', (event) => {
      console.log('[SSE] trade 이벤트:', event.data)
      lastMessage.value = `trade: ${event.data}`
      handleTradeData(event.data)
    })

    // marketClosed 이벤트 처리
    eventSource.addEventListener('marketClosed', (event) => {
      console.log('[SSE] 장 마감:', event.data)
      marketOpen.value = false
      lastMessage.value = `marketClosed: ${event.data}`
    })

    // 에러 처리
    eventSource.addEventListener('error', (event) => {
      console.error('[SSE] 연결 오류:', event)
      connected.value = false
      lastMessage.value = '연결 오류'

      // 3초 후 재연결 시도
      setTimeout(() => {
        if (!connected.value && marketOpen.value) {
          console.log('[SSE] 재연결 시도...')
          connectSSE()
        }
      }, 3000)
    })
  } catch (error) {
    console.error('[SSE] 연결 실패:', error)
    connected.value = false
    lastMessage.value = `연결 실패: ${error.message}`
  }
}

// 일반 메시지 처리
function handleMessage(data) {
  try {
    // JSON 형태의 데이터인지 확인
    if (data.startsWith('{') || data.startsWith('[')) {
      const jsonData = JSON.parse(data)
      console.log('[SSE] JSON 데이터:', jsonData)

      // trade 데이터인지 확인하여 처리
      if (jsonData.stockId || jsonData.tradePrice) {
        handleTradeData(data)
      }
    } else {
      console.log('[SSE] 텍스트 메시지:', data)
    }
  } catch (error) {
    console.warn('[SSE] 메시지 파싱 실패:', error, 'data:', data)
  }
}

// 거래 데이터 처리
function handleTradeData(data) {
  try {
    const trade = typeof data === 'string' ? JSON.parse(data) : data
    console.log('[SSE] 거래 데이터 처리:', trade)

    // 데이터 검증
    if (trade && (trade.stockId || trade.tradePrice)) {
      // 배열 맨 앞에 추가 (최신 데이터가 위에 표시)
      trades.value.unshift(trade)

      // 최대 50개 항목만 유지
      if (trades.value.length > 50) {
        trades.value = trades.value.slice(0, 50)
      }

      console.log(`[SSE] 거래 데이터 추가됨. 총 ${trades.value.length}개`)
    } else {
      console.warn('[SSE] 유효하지 않은 거래 데이터:', trade)
    }
  } catch (error) {
    console.error('[SSE] 거래 데이터 파싱 실패:', error, 'data:', data)
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  console.log(`[MOUNT] stockId: ${stockId}`)

  marketOpen.value = isMarketOpen()
  console.log(`[MOUNT] 장 상태: ${marketOpen.value}`)

  if (marketOpen.value) {
    connectSSE()
  } else {
    console.log('[MOUNT] 장이 닫혀있어 SSE 연결하지 않음')
  }
})

// 컴포넌트 언마운트 시
onBeforeUnmount(() => {
  console.log('[UNMOUNT] SSE 연결 종료')
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})

// 포맷터 함수들
const nf = new Intl.NumberFormat('ko-KR')

const formatPrice = (value) => {
  if (!value) return '0'
  const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
  return isNaN(num) ? value : nf.format(num)
}

const formatVolume = (value) => {
  if (!value) return '0'
  const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
  return isNaN(num) ? value : nf.format(num)
}

const formatNumber = (value) => {
  if (!value) return '0'
  const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
  return isNaN(num) ? value : nf.format(num)
}

function formatChangeRate(rate) {
  if (!rate) return '0.00%'

  let val = rate

  // 이미 %가 포함된 경우
  if (typeof rate === 'string' && rate.includes('%')) {
    val = parseFloat(rate.replace('%', ''))
  } else {
    val = parseFloat(rate)
    // 소수점 형태(0.0731)인 경우 백분율로 변환
    if (Math.abs(val) < 1) {
      val = val * 100
    }
  }

  if (isNaN(val)) return '0.00%'

  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`
}

function formatTime(time) {
  if (!time) return ''
  const timeStr = time.toString()

  // "162924" 형태를 "16:29:24"로 변환
  if (timeStr.length === 6) {
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4)}`
  }

  return timeStr
}

function getChangeClass(rate) {
  if (!rate) return 'neutral'

  const numRate = parseFloat(typeof rate === 'string' ? rate.replace('%', '') : rate)
  if (isNaN(numRate)) return 'neutral'

  if (numRate > 0) return 'positive'
  if (numRate < 0) return 'negative'
  return 'neutral'
}

function getVolumeClass(volume) {
  if (!volume) return 'low-volume'

  const num = parseInt(typeof volume === 'string' ? volume.replace(/,/g, '') : volume)
  if (isNaN(num)) return 'low-volume'

  if (num >= 50) return 'high-volume'
  if (num >= 20) return 'medium-volume'
  return 'low-volume'
}
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
  color: white;
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
  color: white;
}

.tab.active {
  color: #000;
  border-bottom: 2px solid #000;
  font-weight: bold;
  color: white;
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

.market-closed {
  text-align: center;
  padding: 60px;
  font-size: 14px;
  color: #ddd;
  background: #1c1c1c;
  border: 1px solid #444;
  border-radius: 8px;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 12px;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.debug-info p {
  margin: 5px 0;
  color: #666;
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
