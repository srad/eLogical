<template>
  <div>
    <div class="progress" style="height: 2rem">
      <div
        class="progress-bar"
        :class="variantClass"
        :style="{ width: progressPercentage + '%' }"
        role="progressbar"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <strong>{{ currTime }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface StopwatchProps {
  time?: string;
  countingDown?: boolean;
}

const props = withDefaults(defineProps<StopwatchProps>(), {
  time: '0:0',
  countingDown: false,
});

const emit = defineEmits<{
  'timer-ended': [];
  'timer-stopped': [time: string];
}>();

// Reactive state
const currMs = ref<number>(0);
const totalMs = ref<number>(0);
const isRunning = ref<boolean>(false);
const variant = ref<'success' | 'warning' | 'danger'>('success');

// Computed properties
const currTime = computed<string>(() => {
  const currMins = Math.floor(currMs.value / 60000);
  const currSec = Math.floor((currMs.value - currMins * 60000) / 1000);
  return `${currMins}:${currSec}`;
});

const progressPercentage = computed<number>(() => {
  if (totalMs.value === 0) return 0;
  return (currMs.value / totalMs.value) * 100;
});

const variantClass = computed<string>(() => {
  return `bg-${variant.value}`;
});

// Methods
const updateTime = (): void => {
  if (!isRunning.value) return;

  if (props.countingDown) {
    // Countdown mode
    if (currMs.value / totalMs.value <= 0.25 || currMs.value < 10000) {
      variant.value = 'danger';
    } else if (currMs.value / totalMs.value <= 0.5 || currMs.value < 15000) {
      variant.value = 'warning';
    } else {
      variant.value = 'success';
    }

    if (currMs.value - 500 < 0) {
      currMs.value = 0;
      emit('timer-ended');
    } else {
      currMs.value -= 500;
      setTimeout(updateTime, 500);
    }
  } else {
    // Count up mode
    currMs.value += 500;
    setTimeout(updateTime, 500);
  }
};

const startTimer = (): void => {
  isRunning.value = true;
  updateTime();
};

const stopTimer = (): void => {
  isRunning.value = false;
  emit('timer-stopped', props.time);
};

const setupTimer = (): void => {
  const timeParts = props.time.split(':');
  const minToMs = Number(timeParts[0]) * 60000;
  const secsToMs = Number(timeParts[1]) * 1000;
  totalMs.value = minToMs + secsToMs;
  currMs.value = totalMs.value;
};

// Lifecycle
onMounted(() => {
  setupTimer();
});

// Expose methods for parent components
defineExpose({
  startTimer,
  stopTimer,
  setupTimer,
});
</script>

<style scoped></style>
