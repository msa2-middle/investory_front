<!-- src/components/Alarm.vue -->
<template>
  <div class="alarm-container">
    <button class="alarm-btn" type="button" @click="toggleDropdown">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- 읽지 않은 알림 개수 뱃지 -->
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      <!-- 연결 상태 표시 점 제거됨 -->
    </button>
    <div v-if="dropdownOpen" class="alarm-dropdown-menu">
      <div class="dropdown-header">
        <span class="header-title">알림</span>
        <div class="header-actions">
          <span class="connection-info" :class="connectionStatusClass">
            {{ connectionStatusText }}
          </span>
          <button
            v-if="unreadCount > 0"
            @click="handleReadAll"
            class="read-all-btn"
          >
            모두 읽음
          </button>
        </div>
      </div>
      <ul class="alarm-list">
        <li v-if="unreadAlarms.length === 0" class="no-alarms">
          읽지 않은 알림이 없습니다
        </li>
        <li
          v-for="alarm in unreadAlarms"
          :key="alarm.id"
          class="alarm-item"
          :class="{ 'unread': alarm.isRead === 0, 'removing': alarm.isRemoving }"
          @click="handleReadOne(alarm)"
        >
          <div class="alarm-content">
            {{ alarm.content }}
          </div>
          <div class="alarm-time">
            {{ formatTime(alarm.createdAt) }}
          </div>
          <div v-if="alarm.isRead === 0" class="unread-dot"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventSourcePolyfill } from 'event-source-polyfill'
import alarmApi from '@/api/alarmApi.js'
import '../assets/Alarm.css'

const router = useRouter()
const token = localStorage.getItem('accessToken')
const alarms = ref([])
const dropdownOpen = ref(false)

// SSE 연결 관리
const eventSource = ref(null)
const connectionStatus = ref('disconnected') // 'connecting', 'connected', 'disconnected', 'error'
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const reconnectDelay = ref(1000)
const heartbeatInterval = ref(null)
const sessionId = ref(null)

// 읽지 않은 알람만 필터링
const unreadAlarms = computed(() => {
  const filtered = alarms.value.filter(alarm => alarm.isRead === 0 && !alarm.isRemoving).slice(0, 5)
  console.log('unreadAlarms computed:', filtered.length, filtered)
  return filtered
})

// 읽지 않은 알람 개수
const unreadCount = computed(() => {
  const count = alarms.value.filter(alarm => alarm.isRead === 0 && !alarm.isRemoving).length
  console.log('unreadCount computed:', count)
  return count
})

// 연결 상태에 따른 CSS 클래스
const connectionStatusClass = computed(() => {
  return {
    'status-connecting': connectionStatus.value === 'connecting',
    'status-connected': connectionStatus.value === 'connected',
    'status-disconnected': connectionStatus.value === 'disconnected',
    'status-error': connectionStatus.value === 'error'
  }
})

// 연결 상태 텍스트
const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting': return '연결 중...'
    case 'connected': return '실시간 연결됨'
    case 'disconnected': return '연결 끊김'
    case 'error': return '연결 오류'
    default: return '알 수 없음'
  }
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function addNotification(alarmData) {
  console.log('addNotification 받은 데이터:', alarmData)

  const newAlarm = {
    id: alarmData.alarmId || alarmData.id,
    content: alarmData.content,
    isRead: 0,
    isRemoving: false,
    createdAt: alarmData.createdAt || new Date().toISOString(),
    targetUrl: alarmData.targetUrl,
    type: alarmData.type,
    user: alarmData.user
  }

  console.log('생성된 새 알람:', newAlarm)
  alarms.value.unshift(newAlarm)

  // 브라우저 알림 표시
  showBrowserNotification(newAlarm)

  // 전체 알람이 너무 많으면 오래된 것 제거
  if (alarms.value.length > 50) {
    alarms.value = alarms.value.slice(0, 50)
  }
}

function showBrowserNotification(alarm) {
  if (Notification.permission === 'granted') {
    new Notification(alarm.type || '알림', {
      body: alarm.content,
      icon: '/favicon.ico',
      tag: `alarm-${alarm.id}`
    })
  }
}

async function fetchAlarms() {
  try {
    const res = await alarmApi.getAlarms({
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })

    console.log('fetchAlarms 응답:', res.data)

    alarms.value = (res.data || []).map(alarm => {
      console.log('알람 데이터:', alarm)
      return {
        id: alarm.alarmId,
        content: alarm.content,
        isRead: alarm.isRead,
        isRemoving: false,
        createdAt: alarm.createdAt || new Date().toISOString(),
        targetUrl: alarm.targetUrl,
        type: alarm.type,
        user: alarm.user
      }
    })

    console.log('처리된 alarms.value:', alarms.value)
  } catch (err) {
    console.error('알람 로드 실패:', err)
  }
}

async function handleReadAll() {
  try {
    const res = await alarmApi.readAll({
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })

    // 읽지 않은 알람들에 애니메이션 효과 추가
    alarms.value = alarms.value.map(alarm => ({
      ...alarm,
      isRemoving: alarm.isRead === 0 ? true : alarm.isRemoving
    }))

    // 애니메이션 후 실제로 읽음 처리
    setTimeout(() => {
      alarms.value = alarms.value.map(alarm => ({
        ...alarm,
        isRead: 1,
        isRemoving: false
      }))
    }, 300)

    console.log('모든 알람 읽음 처리 완료')
  } catch (err) {
    console.error('모든 알람 읽음 처리 실패:', err)
  }
}

async function handleReadOne(alarm) {
  if (alarm.isRead === 1) return

  console.log('=== 알람 클릭 시작 ===')
  console.log('클릭된 알람:', JSON.stringify(alarm, null, 2))

  try {
    const alarmIndex = alarms.value.findIndex(a => a.id === alarm.id)
    console.log('찾은 알람 인덱스:', alarmIndex)

    if (alarmIndex !== -1) {
      alarms.value[alarmIndex].isRemoving = true
    }

    const res = await alarmApi.readOne(alarm.id, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })

    console.log('API 호출 성공:', res)

    setTimeout(() => {
      if (alarmIndex !== -1) {
        alarms.value[alarmIndex] = {
          ...alarms.value[alarmIndex],
          isRead: 1,
          isRemoving: false
        }

        alarms.value = [...alarms.value]
      }

      if (alarm.targetUrl) {
        console.log('페이지 이동:', alarm.targetUrl)

        try {
          dropdownOpen.value = false
          router.push(alarm.targetUrl)
        } catch (routerError) {
          console.error('라우팅 에러:', routerError)
          alert('해당 페이지로 이동할 수 없습니다.')
        }
      }
    }, 300)

    console.log('=== 알람 클릭 완료 ===')
  } catch (err) {
    console.error('알람 읽음 처리 실패:', err)
    const alarmIndex = alarms.value.findIndex(a => a.id === alarm.id)
    if (alarmIndex !== -1) {
      alarms.value[alarmIndex].isRemoving = false
    }
  }
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString()
}

// === SSE 연결 관리 ===

function connectSSE() {
  if (eventSource.value && eventSource.value.readyState === EventSource.OPEN) {
    console.log('이미 SSE 연결이 활성화되어 있습니다.')
    return
  }

  console.log('SSE 연결 시도 중...')
  connectionStatus.value = 'connecting'

  try {
    eventSource.value = new EventSourcePolyfill("http://localhost:8091/alarm/sse", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      withCredentials: true
    })

    // 연결 성공 이벤트
    eventSource.value.addEventListener('connected', (event) => {
      console.log('SSE 연결 성공:', event.data)
      const data = JSON.parse(event.data)
      sessionId.value = data.sessionId
      connectionStatus.value = 'connected'
      reconnectAttempts.value = 0

      // Heartbeat 시작
      startHeartbeat()
    })

    // 알람 수신 이벤트
    eventSource.value.addEventListener('alarm', (event) => {
      console.log('SSE 알람 이벤트 받음:', event.data)
      const data = JSON.parse(event.data)
      console.log('파싱된 SSE 데이터:', data)
      addNotification(data)
    })

    // Heartbeat 이벤트
    eventSource.value.addEventListener('heartbeat', (event) => {
      console.debug('Heartbeat 받음:', event.data)
      sendHeartbeatResponse()
    })

    // 연결 에러
    eventSource.value.onerror = (error) => {
      console.error('SSE 연결 에러:', error)
      connectionStatus.value = 'error'
      stopHeartbeat()

      // 재연결 시도
      handleReconnect()
    }

    // 연결 종료
    eventSource.value.onclose = () => {
      console.log('SSE 연결 종료')
      connectionStatus.value = 'disconnected'
      stopHeartbeat()
    }

  } catch (error) {
    console.error('SSE 연결 생성 실패:', error)
    connectionStatus.value = 'error'
  }
}

function disconnectSSE() {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }

  stopHeartbeat()
  sessionId.value = null
  connectionStatus.value = 'disconnected'
  reconnectAttempts.value = 0

  // 서버에 연결 해제 알림
  fetch('http://localhost:8091/alarm/unsubscribe', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).catch(err => console.warn('연결 해제 알림 실패:', err))
}

function handleReconnect() {
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    console.error('최대 재연결 시도 횟수에 도달했습니다.')
    connectionStatus.value = 'error'
    return
  }

  reconnectAttempts.value++
  const delay = reconnectDelay.value * Math.pow(2, reconnectAttempts.value - 1) // 지수 백오프

  console.log(`${delay}ms 후 재연결 시도... (시도 ${reconnectAttempts.value}/${maxReconnectAttempts})`)

  setTimeout(() => {
    if (eventSource.value) {
      eventSource.value.close()
    }
    connectSSE()
  }, delay)
}

function startHeartbeat() {
  // 기존 heartbeat 정리
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value)
  }

  // 클라이언트에서도 주기적으로 heartbeat 전송
  heartbeatInterval.value = setInterval(() => {
    sendHeartbeatResponse()
  }, 60000) // 1분마다
}

function stopHeartbeat() {
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value)
    heartbeatInterval.value = null
  }
}

async function sendHeartbeatResponse() {
  try {
    await fetch('http://localhost:8091/alarm/heartbeat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    console.debug('Heartbeat 응답 전송 완료')
  } catch (err) {
    console.debug('Heartbeat 응답 전송 실패:', err)
  }
}

// 페이지 가시성 변경 감지
function handleVisibilityChange() {
  if (document.hidden) {
    console.debug('페이지가 숨겨짐 - 연결 유지')
  } else {
    console.debug('페이지가 다시 보임 - 연결 상태 확인')
    if (!eventSource.value || eventSource.value.readyState !== EventSource.OPEN) {
      connectSSE()
    }
  }
}

// 외부 클릭 감지 함수
function handleClickOutside(event) {
  const alarmContainer = document.querySelector('.alarm-container')
  if (alarmContainer && !alarmContainer.contains(event.target)) {
    dropdownOpen.value = false
  }
}

// 라이프사이클 훅
onMounted(async () => {
  // 브라우저 알림 권한 요청
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }

  // 알람 데이터 로드
  await fetchAlarms()

  // SSE 연결
  connectSSE()

  // 이벤트 리스너 등록
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // 정리 작업
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  disconnectSSE()
})
</script>

<style scoped>
/* 연결 상태 관련 스타일 제거됨 */

.connection-info {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}

.connection-info.status-connected {
  background-color: #d1fae5;
  color: #065f46;
}

.connection-info.status-connecting {
  background-color: #fef3c7;
  color: #92400e;
}

.connection-info.status-disconnected,
.connection-info.status-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.header-actions {
  display: flex;
  align-items: center;
}

.alarm-container {
  position: relative;
}
</style>
