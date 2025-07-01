<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { ref } from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, zoomPlugin, BarElement)

const emit = defineEmits(['point-click'])

defineProps({
  chartData: Object,
})

const chartRef = ref(null)

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: 'x',
      },
    },
  },
  scales: {
    y: {
      display: true,
      position: 'left',
      grid: { drawOnChartArea: true },
      ticks: {
        color: '#a0aec0',
        font: { size: 12 },
      },
    },
    y2: {
      display: false,
      position: 'right',
      grid: { drawOnChartArea: false },
      min: 0,
      max: (ctx) => {
        const max = ctx.chart.data.datasets[1]?.data?.reduce((a, b) => Math.max(a, b), 0) || 100
        return max * 8
      },
    },
  },
  onClick: (e, elements, chart) => {
    if (elements.length > 0) {
      const idx = elements[0].index
      const date = chart.data.labels[idx]
      emit('point-click', date)
    }
  },
}
</script>

<template>
  <Line
    ref="chartRef"
    :data="chartData"
    :options="chartOptions"
  />
</template>

