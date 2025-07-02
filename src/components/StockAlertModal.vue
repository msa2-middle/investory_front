<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">📈 {{ stockName || stockCode }} 주가 알림 설정</h3>
        <button type="button" class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="onSave">
        <div class="form-group">
          <label class="form-label">목표가</label>
          <input
            type="text"
            v-model="targetPrice"
            class="form-input"
            placeholder="예: 50000"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">알림 조건</label>
          <select v-model="condition" class="form-select">
            <option value="ABOVE">목표가 이상일 때</option>
            <option value="BELOW">목표가 이하일 때</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-cancel" @click="$emit('close')">취소</button>
          <button type="submit" class="btn btn-save">알림 설정</button>
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
  stockName: String,
})

const { show, stockCode, stockName } = toRefs(props)
const emit = defineEmits(['close', 'save'])

const targetPrice = ref('')
const condition = ref('ABOVE')

// 모달이 열릴 때마다 입력값 초기화
watch(show, (val) => {
  if (val) {
    targetPrice.value = ''
    condition.value = 'ABOVE'
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
  } else {
    // 모달이 닫힐 때 body 스크롤 복원
    document.body.style.overflow = ''
  }
})

// ESC 키로 모달 닫기
function handleKeydown(event) {
  if (event.key === 'Escape' && show.value) {
    emit('close')
  }
}

// 오버레이 클릭 시 모달 닫기
function handleOverlayClick() {
  emit('close')
}

function onSave() {
  if (!targetPrice.value || targetPrice.value <= 0) {
    alert('올바른 목표가를 입력해주세요.')
    return
  }

  emit('save', {
    stockCode: stockCode.value,
    targetPrice: targetPrice.value,
    condition: condition.value,
  })
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 컴포넌트 해제 시 body 스크롤 복원
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
  z-index: 1000;
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
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  color: white;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  animation: slideIn 0.3s ease-out;
  border: 1px solid #374151;
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
}

.close-btn:hover {
  color: white;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
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
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #4b5563;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #374151;
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
}

.btn-cancel {
  background: #4b5563;
  color: #d1d5db;
}

.btn-cancel:hover {
  background: #6b7280;
  transform: translateY(-1px);
}

.btn-save {
  background: #3b82f6;
  color: white;
}

.btn-save:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn:active {
  transform: translateY(0);
}
</style>
