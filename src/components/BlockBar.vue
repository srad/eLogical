<template>
  <div class="w-100 h-100 d-flex gap-0.5">
    <div
      v-for="index in max"
      :key="index"
      class="flex-grow-1 rounded-1 h-100 border-end border-white block-item bg-secondary"
      :class="{ 'fill-animation': index <= current }"
      :style="{
        '--fill-color': index <= current ? colors[index - 1] : '',
        '--animation-delay': (index + 1) * 300 + 'ms',
      }"
    >
      <span class="fw-bold d-flex align-items-center justify-content-center h-100 position-relative" style="z-index: 1">
        {{ index }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  delay?: number;
  max: number;
  current: number;
  colors: (string | undefined)[];
}

const props = withDefaults(defineProps<Props>(), {
  delay: 400,
});
</script>

<style scoped>
.block-item {
  position: relative;
  overflow: hidden;
}

.fill-animation::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--fill-color);
  transform: scaleX(0);
  transform-origin: left;
  animation: fillFromLeft 0.3s ease-out forwards;
  animation-delay: var(--animation-delay);
  z-index: 0;
}

@keyframes fillFromLeft {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
