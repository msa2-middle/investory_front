<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">⚙️ {{ stockCode }} 주가 알림 관리</h3>
        <button type="button" class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="current-setting">
        <h4>현재 설정</h4>
        <div class="setting-info">
          <span class="setting-label">목표가:</span>
          <span class="setting-value">{{ formatPrice(currentSetting.targetPrice) }}원</span>
        </div>
        <div class="setting-info">
          <span class="setting-label">조건:</span>
          <span class="setting-value">
            {{ currentSetting.condition === 'ABOVE' ? '목표가 이상일 때' : '목표가 이하일 때' }}
          </span>
        </div>
      </div>

      <form @submit.prevent="onUpdate">
        <div class="form-group">
          <label class="form-label">새 목표가</label>
          <input
            type="number"
            v-model.number="newTargetPrice"
            class="form-input"
            :placeholder="currentSetting.targetPrice"
            required
            min="1"
            step="1"
          />
        </div>

        <div class="form-group">
          <label class="form-label">알림 조건</label>
          <select v-model="newCondition" class="form-select">
            <option value="ABOVE">목표가 이상일 때</option>
            <option value="BELOW">목표가 이하일 때</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-delete" @click="onDelete">
            🗑️ 삭제
          </button>
          <div class="right-actions">
            <button type="button" class="btn btn-cancel" @click="$emit('close')">취소</button>
            <button type="submit" class="btn btn-update">수정</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  stockCode: String,
  stockId: String, // stockId 추가
  currentSetting: {
    type: Object,
    default: () => ({
      targetPrice: 0,
      condition: 'ABOVE'
    })
  }
})

const { show, stockCode, stockId, currentSetting } = toRefs(props)
const emit = defineEmits(['close', 'update', 'delete'])

const newTargetPrice = ref(0)
const newCondition = ref('ABOVE')

// 모달이 열릴 때마다 현재 설정값으로 초기화
watch(show, (val) => {
  if (val && currentSetting.value) {
    // 숫자로 변환하여 설정
    newTargetPrice.value = Number(currentSetting.value.targetPrice) || 0
    newCondition.value = currentSetting.value.condition || 'ABOVE'
    document.body.style.overflow = 'hidden'

    console.log('모달 열림 - 현재 설정:', currentSetting.value)
    console.log('초기화된 값:', {
      targetPrice: newTargetPrice.value,
      condition: newCondition.value
    })
  } else {
    document.body.style.overflow = ''
  }
})

// currentSetting이 변경될 때도 값 업데이트
watch(currentSetting, (newVal) => {
  if (newVal && show.value) {
    newTargetPrice.value = Number(newVal.targetPrice) || 0
    newCondition.value = newVal.condition || 'ABOVE'

    console.log('currentSetting 변경됨:', newVal)
  }
}, { deep: true })

function formatPrice(price) {
  const numPrice = Number(price)
  return isNaN(numPrice) ? '0' : numPrice.toLocaleString()
}

function handleKeydown(event) {
  if (event.key === 'Escape' && show.value) {
    emit('close')
  }
}

function handleOverlayClick() {
  emit('close')
}

function onUpdate() {
  if (!newTargetPrice.value || newTargetPrice.value <= 0) {
    alert('올바른 목표가를 입력해주세요.')
    return
  }

  console.log('수정 요청:', {
    stockId: stockId.value,
    stockCode: stockCode.value,
    targetPrice: newTargetPrice.value,
    condition: newCondition.value,
  })

  emit('update', {
    stockId: stockId.value,
    stockCode: stockCode.value,
    targetPrice: newTargetPrice.value,
    condition: newCondition.value,
  })
}

function onDelete() {
  if (confirm(`${stockCode.value} 주식의 알림 설정을 삭제하시겠습니까?`)) {
    console.log('삭제 요청:', {
      stockId: stockId.value,
      stockCode: stockCode.value
    })

    emit('delete', {
      stockId: stockId.value,
      stockCode: stockCode.value,
      confirmed: true  // 이미 확인했다는 플래그 추가
    })
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 28px;
  width: 450px;
  max-width: 90vw;
  max-height: 90vh;
  color: white;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  animation: slideIn 0.3s ease-out;
  border: 1px solid #374151;
  position: relative;
  z-index: 20001;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #f9fafb;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 28px;
  cursor: pointer;
  padding: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 20002;
}

.close-btn:hover {
  color: white;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.current-setting {
  background: #374151;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.current-setting h4 {
  margin: 0 0 12px 0;
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.setting-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.setting-info:last-child {
  margin-bottom: 0;
}

.setting-label {
  color: #9ca3af;
  font-size: 13px;
}

.setting-value {
  color: #f9fafb;
  font-size: 13px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  position: relative;
  z-index: 20001;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #4b5563;
  z-index: 20002;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #374151;
}

.right-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  position: relative;
  z-index: 20001;
}

.btn:hover {
  z-index: 20002;
}

.btn-cancel {
  background: #4b5563;
  color: #d1d5db;
}

.btn-cancel:hover {
  background: #6b7280;
  transform: translateY(-1px);
}

.btn-update {
  background: #3b82f6;
  color: white;
}

.btn-update:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn:active {
  transform: translateY(0);
}
</style>
