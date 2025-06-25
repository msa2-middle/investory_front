<template>
  <!-- 간단하게 <dialog> 사용, 라이브러리 쓰면 여기만 교체 -->
  <dialog :open="show" class="alert-dialog">
    <h3>📈 {{ stockCode }} 알림 설정</h3>

    <form @submit.prevent="onSave">
      <label>
        목표가
        <input type="number" v-model.number="targetPrice" required />
      </label>

      <label>
        조건
        <select v-model="condition">
          <option value="ABOVE">이상 시</option>
          <option value="BELOW">이하 시</option>
        </select>
      </label>

      <div class="btn-group">
        <button type="button" @click="$emit('close')">취소</button>
        <button type="submit">저장</button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'

/* 1) props 객체로 받기 */
const props = defineProps({
  show: Boolean,
  stockCode: String
})

/* 2) 필요하면 toRefs 로 반응형 ref 분리 (선택)  */
const { show, stockCode } = toRefs(props)

/* emit 은 그대로 */
const emit = defineEmits(['close', 'save'])

/* 내부 상태 */
const targetPrice = ref('')
const condition   = ref('ABOVE')

/* 3) 모달이 열릴 때마다 입력값 초기화 */
watch(show, (val) => {
  if (val) {
    targetPrice.value = ''
    condition.value   = 'ABOVE'
  }
})

function onSave () {
  emit('save', {
    stockCode: stockCode.value,
    targetPrice: targetPrice.value,
    condition:   condition.value
  })
}
</script>

<style scoped>
.alert-dialog { padding: 24px; border: none; border-radius: 8px; }
.btn-group    { display: flex; gap: 8px; margin-top: 16px; }
</style>
