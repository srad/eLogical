<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  chartData?: any;
  options?: any;
}

const props = withDefaults(defineProps<Props>(), {
  chartData: () => ({}),
  options: () => ({}),
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);

watch(
  () => props.chartData,
  () => {
    // Update chart when data changes
  },
  { deep: true }
);
</script>
