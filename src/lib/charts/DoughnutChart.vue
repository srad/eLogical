<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import './charts.css';
import { ArcElement, Chart as ChartJS, DoughnutController, Legend, Tooltip } from 'chart.js';

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend);

interface Props {
  chartData?: any;
  options?: any;
}

const props = withDefaults(defineProps<Props>(), {
  chartData: () => ({}),
  options: () => ({}),
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: ChartJS | null = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new chart
  chartInstance = new ChartJS(chartCanvas.value, {
    type: 'doughnut',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options,
    },
  });
};

watch(
  () => props.chartData,
  () => {
    createChart();
  },
  { deep: true }
);

onMounted(() => {
  createChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
