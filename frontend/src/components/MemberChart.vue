<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: number[]
  labels: string[]
  type?: 'line' | 'bar'
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

onMounted(() => {
  if (chartCanvas.value) {
    createChart()
  }
})

watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = props.data
    chartInstance.update()
  }
}, { deep: true })

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: props.type || 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Members',
        data: props.data,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#d4af37',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#e5c866',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          titleColor: '#d4af37',
          bodyColor: '#ffffff',
          borderColor: '#d4af37',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(42, 42, 42, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#888',
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(42, 42, 42, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#888',
            font: {
              size: 11
            }
          },
          beginAtZero: true
        }
      }
    }
  })
}
</script>

<style scoped>
.chart-container {
  height: 250px;
  width: 100%;
  position: relative;
}
</style>

