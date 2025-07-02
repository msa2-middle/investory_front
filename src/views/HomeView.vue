<template>
  <div class="content-layout">
    <StockRealtimeChart />
    <StockRight />
  </div>
</template>

<script>
import StockRealtimeChart from '@/components/StockRealtimeChart.vue'
import StockRight from '@/components/StockRight.vue'

export default {
  name: 'HomeView',
  components: {
    StockRealtimeChart,
    StockRight
  }
}
</script>

<style scoped>
/* 필요하면 기존 css 중 content-layout 관련 스타일을 이쪽에 옮겨도 됨 */
</style>
