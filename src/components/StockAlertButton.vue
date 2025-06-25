<template>
  <button class="alert-btn" @click="$emit('open')">🔔 알림</button>
</template>

<script setup></script>

<style scoped>
.alert-btn {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
