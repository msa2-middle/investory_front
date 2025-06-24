<!-- src/components/Alarm.vue -->
<template>
  <div class="alarm-container">
    <button class="alarm-btn" type="button" @click="toggleDropdown">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- 알림 개수 뱃지 (알림이 있을 때만 표시) -->
      <span v-if="alarms.length > 0" class="notification-badge">{{ alarms.length }}</span>
    </button>
    <ul v-if="dropdownOpen" class="dropdown-menu show">
      <li v-if="alarms.length === 0" class="no-alarms">
        알림이 없습니다
      </li>
      <li v-for="(alarm, index) in alarms" :key="index" class="alarm-item">
        {{ alarm }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import alarmApi from '@/api/alarmApi.js'

const token = localStorage.getItem('accessToken')
const alarms = ref([])
const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function addNotification(content) {
  alarms.value.unshift(content)
  if (alarms.value.length > 5) alarms.value.pop()
}

function showAlarm(content) {
  console.log('새 알람:', content)
}

async function fetchAlarms() {
  try {
    const res = await alarmApi.getAlarms({
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })

    // axios는 응답 데이터가 res.data에 있음
    alarms.value = res.data.slice(0, 5).map(a => a.content)
  } catch (err) {
    console.error('알람 로드 실패:', err)
  }
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
    const data = JSON.parse(event.data)
    addNotification(data.content)
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
.alarm-container {
  position: relative;
}

.alarm-btn {
  position: relative;
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alarm-btn:hover {
  background-color: #374151;
  color: white;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 6px;
  min-width: 280px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
}

.no-alarms {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.alarm-item {
  padding: 12px 16px;
  border-bottom: 1px solid #374151;
  color: white;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.alarm-item:hover {
  background-color: #374151;
}

.alarm-item:last-child {
  border-bottom: none;
}
</style>
