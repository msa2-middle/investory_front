<template>
  <button class="alert-btn" @click="$emit('open')">주가 설정</button>
</template>

<script setup>
</script>

<style scoped>
.alert-btn {
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;


  color: #94A3B8;
  font-size: 13px;
  font-weight: 400;
  padding: 4px 8px;

  display: inline-flex;
  align-items: center;
}

.alert-btn:hover,
.alert-btn:focus {
  color: #FFFFFF;
  text-decoration: underline;
}
</style>
