<template>
  <div class="alert-manage-container" ref="containerRef">
    <button class="alert-manage-btn" @click="toggleMenu">
      설정됨 ▼
    </button>

    <!-- 드롭다운 메뉴 -->
    <div v-if="showMenu" class="edit-dropdown-menu" @click.stop>
      <button class="menu-item modify" @click="handleModify">
        ✏️ 수정
      </button>
      <button class="menu-item delete" @click="handleDelete">
        🗑️ 삭제
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['modify', 'delete'])

const showMenu = ref(false)
const containerRef = ref(null)

function toggleMenu() {
  console.log('toggleMenu 호출됨, 현재 showMenu:', showMenu.value)
  showMenu.value = !showMenu.value
  console.log('toggleMenu 후 showMenu:', showMenu.value)
}

// 외부 클릭 시 메뉴 닫기
function handleClickOutside(event) {
  console.log('외부 클릭 감지됨')

  // containerRef가 존재하고, 클릭된 요소가 컨테이너 내부에 있지 않은 경우에만 메뉴 닫기
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    console.log('메뉴 닫기')
    showMenu.value = false
  }
}

function handleModify() {
  console.log('수정 버튼 클릭됨')
  showMenu.value = false
  emit('modify')
}

function handleDelete() {
  console.log('삭제 버튼 클릭됨')
  showMenu.value = false
  emit('delete')
}

onMounted(() => {
  console.log('StockAlertManageButton 마운트됨')
  // 캡처 단계에서 이벤트를 처리하여 더 정확한 외부 클릭 감지
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  console.log('StockAlertManageButton 언마운트됨')
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.alert-manage-container {
  position: relative;
  display: inline-block;
  /* z-index 제거하여 기본값 사용 */
}

.alert-manage-btn {
  appearance: none;
  background: #059669;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  /* position과 z-index 제거하여 주가 설정 버튼과 동일한 레벨로 설정 */
}

.alert-manage-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

.edit-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  z-index: 10000; /* 원래대로 10000으로 복원 */
  min-width: 120px;
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;
  /* 다른 요소들 위에 확실히 표시되도록 추가 스타일 */
  isolation: isolate;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 10001; /* 원래대로 10001로 복원 */
}

.menu-item:hover {
  background: #4b5563;
}

.menu-item.modify:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.menu-item.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 드롭다운이 열려있을 때 컨테이너의 z-index를 더 높게 설정 */
.alert-manage-container:has(.edit-dropdown-menu) {
  z-index: 10000;
}
</style>
