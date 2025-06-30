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
    </button>
    <div v-if="dropdownOpen" class="alarm-dropdown-menu">
      <div class="dropdown-header">
        <span class="header-title">알림</span>
        <button
          v-if="unreadCount > 0"
          @click="handleReadAll"
          class="read-all-btn"
        >
          모두 읽음
        </button>
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
import { computed, onMounted, ref } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import alarmApi from '@/api/alarmApi.js'
import '../assets/Alarm.css'

const token = localStorage.getItem('accessToken')
const alarms = ref([]) // 전체 알람 리스트 (id, content, isRead, createdAt 포함)
const dropdownOpen = ref(false)

// 읽지 않은 알람만 필터링 (isRead가 integer 타입: 0=안읽음, 1=읽음)
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

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function addNotification(alarmData) {
  console.log('addNotification 받은 데이터:', alarmData)

  // 새 알람을 맨 앞에 추가 (isRead: integer 타입)
  // SSE로 받은 데이터의 ID 구조를 통일
  const newAlarm = {
    id: alarmData.alarmId || alarmData.id, // alarmId가 있으면 사용, 없으면 id 사용
    content: alarmData.content,
    isRead: 0, // 0 = 읽지 않음
    isRemoving: false,
    createdAt: alarmData.createdAt || new Date().toISOString(),
    type: alarmData.type,
    user: alarmData.user
  }

  console.log('생성된 새 알람:', newAlarm)
  alarms.value.unshift(newAlarm)

  // 전체 알람이 너무 많으면 오래된 것 제거 (선택사항)
  if (alarms.value.length > 50) {
    alarms.value = alarms.value.slice(0, 50)
  }
}

function showAlarm(content) {
  console.log('새 알람:', content)
  // 여기에 브라우저 알림이나 토스트 알림 추가 가능
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

    // 백엔드에서 받은 알람 데이터 구조에 맞게 수정
    alarms.value = (res.data || []).map(alarm => {
      console.log('알람 데이터:', alarm)
      return {
        id: alarm.alarmId, // alarmId를 id로 매핑
        content: alarm.content,
        isRead: alarm.isRead, // isRead 그대로 사용
        isRemoving: false,
        createdAt: alarm.createdAt || new Date().toISOString(), // null인 경우 현재 시간 사용
        type: alarm.type,
        user: alarm.user
      }
    })

    console.log('처리된 alarms.value:', alarms.value)
    console.log('unreadAlarms 개수:', unreadAlarms.value.length)
    console.log('unreadCount:', unreadCount.value)
    console.log('첫 번째 알람:', alarms.value[0])
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
        isRead: 1, // 1 = 읽음
        isRemoving: false
      }))
    }, 300)

    console.log('모든 알람 읽음 처리 완료')
  } catch (err) {
    console.error('모든 알람 읽음 처리 실패:', err)
  }
}

async function handleReadOne(alarm) {
  if (alarm.isRead === 1) return // 이미 읽은 알람이면 처리하지 않음

  console.log('=== 알람 클릭 시작 ===')
  console.log('클릭된 알람:', JSON.stringify(alarm, null, 2))
  console.log('전체 alarms.value 길이:', alarms.value.length)

  try {
    // 먼저 해당 알람에 제거 애니메이션 적용
    const alarmIndex = alarms.value.findIndex(a => a.id === alarm.id)
    console.log('찾은 알람 인덱스:', alarmIndex)

    if (alarmIndex !== -1) {
      console.log('애니메이션 시작 전 상태:', alarms.value[alarmIndex])
      alarms.value[alarmIndex].isRemoving = true
      console.log('애니메이션 시작 후 상태:', alarms.value[alarmIndex])
    }

    // API 호출 시 실제 백엔드에서 사용하는 ID 사용
    const res = await alarmApi.readOne(alarm.id, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })

    console.log('API 호출 성공:', res)

    // 애니메이션 완료 후 실제로 읽음 처리
    setTimeout(() => {
      if (alarmIndex !== -1) {
        console.log('읽음 처리 시작')
        console.log('처리 전 알람 상태:', alarms.value[alarmIndex])

        // Vue 반응성을 확실히 하기 위해 새 객체로 교체
        alarms.value[alarmIndex] = {
          ...alarms.value[alarmIndex],
          isRead: 1, // 1 = 읽음
          isRemoving: false
        }

        console.log('처리 후 알람 상태:', alarms.value[alarmIndex])
        console.log('전체 알람 상태:', alarms.value.map(a => ({ id: a.id, isRead: a.isRead, isRemoving: a.isRemoving })))

        // 강제로 반응성 트리거 (필요한 경우)
        alarms.value = [...alarms.value]
      }
    }, 300)

    console.log('=== 알람 클릭 완료 ===')
  } catch (err) {
    console.error('알람 읽음 처리 실패:', err)
    // 오류 발생 시 애니메이션 상태 되돌리기
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

function initializeSSE() {
  const eventSource = new EventSourcePolyfill("http://localhost:8091/alarm/sse", {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    },
    withCredentials: true
  })

  eventSource.addEventListener('alarm', (event) => {
    console.log('SSE 이벤트 받음:', event.data)
    const data = JSON.parse(event.data)
    console.log('파싱된 SSE 데이터:', data)
    addNotification(data)
    showAlarm(data.content)
  })

  eventSource.onerror = (e) => {
    console.error('SSE 에러:', e)
  }
}

onMounted(() => {
  fetchAlarms()
  initializeSSE()
})
</script>

<style scoped>

</style>

