<template>
  <span
    class="tooltip-trigger"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @mousemove="moveTooltip"
    v-html="label"
  ></span>
</template>

<script setup>
import { onUnmounted } from 'vue'

const props = defineProps({
  label: String,
  desc: String,
})

let tooltipEl = null

function showTooltip(e) {
  tooltipEl = document.createElement('div')
  tooltipEl.className = 'global-tooltip'
  tooltipEl.innerText = props.desc
  document.body.appendChild(tooltipEl)
  moveTooltip(e)
}

function hideTooltip() {
  if (tooltipEl && tooltipEl.remove) {
    tooltipEl.remove()
    tooltipEl = null
  }
}

function moveTooltip(e) {
  if (tooltipEl) {
    tooltipEl.style.position = 'fixed'
    tooltipEl.style.top = `${e.clientY - 40}px`
    tooltipEl.style.left = `${e.clientX}px`
    tooltipEl.style.zIndex = '9999'
  }
}

onUnmounted(() => {
  hideTooltip()
})
</script>

<style scoped>
.tooltip-trigger {
  cursor: help;
  font-weight: bold;
}
</style>

<style>
.global-tooltip {
  background-color: #374151;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: opacity 0.15s;
}
</style>
