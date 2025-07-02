<template>
  <div id="app">
    <component :is="layoutComponent" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import UserLayout from './layouts/UserLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'

const authStore = useAuthStore()

const layoutComponent = computed(() => {
  return authStore.role === 'ADMIN' ? AdminLayout : UserLayout
})
</script>
