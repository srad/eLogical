<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import './charts.css';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const defaultBarStyles = {
  backgroundColor: [
    'rgba(255, 99, 132, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(201, 203, 207, 0.2)',
  ],
  borderColor: [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
  ],
  borderWidth: 1,
};

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Apply default styles to datasets
  const enhancedData = {
    ...props.chartData,
    datasets: props.chartData?.datasets?.map((dataset: any) => ({
      ...defaultBarStyles,
      ...dataset,
    })) || [],
  };

  // Create new chart
  chartInstance = new ChartJS(chartCanvas.value, {
    type: 'bar',
    data: enhancedData,
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
