<template>
  <div class="chart-container" :class="{ 'chart-clickable': type === 'bar' }">
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
  label?: string
}>()

const emit = defineEmits<{
  (e: 'monthClick', monthIndex: number, monthLabel: string): void
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

onMounted(() => {
  if (chartCanvas.value) {
    createChart()
  }
})

watch(() => props.data, () => {
  if (chartInstance && chartInstance.data.datasets[0]) {
    chartInstance.data.datasets[0].data = props.data
    chartInstance.update()
  }
}, { deep: true })

watch(() => props.type, () => {
  if (chartInstance && chartCanvas.value) {
    chartInstance.destroy()
    createChart()
  }
}, { deep: true })

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const isBarChart = props.type === 'bar'
  const chartLabel = props.label || (isBarChart ? 'Profit' : 'Members')
  
  chartInstance = new Chart(ctx, {
    type: props.type || 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: chartLabel,
        data: props.data,
        borderColor: '#d4af37',
        backgroundColor: isBarChart ? 'rgba(212, 175, 55, 0.6)' : 'rgba(212, 175, 55, 0.1)',
        borderWidth: isBarChart ? 1 : 2,
        fill: !isBarChart,
        tension: isBarChart ? 0 : 0.4,
        pointBackgroundColor: '#d4af37',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: isBarChart ? 0 : 4,
        pointHoverRadius: isBarChart ? 0 : 6,
        pointHoverBackgroundColor: '#e5c866',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        borderRadius: isBarChart ? 4 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onHover: (_event, elements) => {
        if (isBarChart && chartCanvas.value) {
          chartCanvas.value.style.cursor = elements.length > 0 ? 'pointer' : 'default'
        }
      },
      onClick: (_event, elements) => {
        if (isBarChart && elements.length > 0) {
          const element = elements[0]
          if (element && element.index !== undefined) {
            const monthIndex = element.index
            const monthLabel = props.labels[monthIndex]
            if (monthLabel) {
              emit('monthClick', monthIndex, monthLabel)
            }
          }
        }
      },
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
          displayColors: false,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y
              if (isBarChart && value !== null && value !== undefined) {
                return `${chartLabel}: ₪${value.toLocaleString()}`
              }
              return `${chartLabel}: ${value ?? 0}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(42, 42, 42, 0.5)'
          },
          border: {
            display: false
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
            color: 'rgba(42, 42, 42, 0.5)'
          },
          border: {
            display: false
          },
          ticks: {
            color: '#888',
            font: {
              size: 11
            },
            callback: (value) => {
              if (isBarChart && value !== null && value !== undefined) {
                return `₪${Number(value).toLocaleString()}`
              }
              return value
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

.chart-clickable canvas {
  cursor: pointer;
}
</style>

