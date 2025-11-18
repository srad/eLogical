<template>
  <svg class="checkmark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle class="checkmark-circle" cx="50" cy="50" r="45" fill="none" stroke="#28a745" stroke-width="3" />
    <path class="checkmark-path" d="M 25 50 L 45 70 L 75 30" fill="none" stroke="#28a745" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
// No props or emits needed - this is a pure presentation component
</script>

<style scoped>
.checkmark {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 0 20px rgba(40, 167, 69, 0.6));
}

.checkmark-circle {
  animation: circleGrow 0.4s ease-out forwards;
}

.checkmark-path {
  animation: checkmarkDraw 0.6s ease-out 0.2s forwards;
  stroke-dasharray: 110;
  stroke-dashoffset: 110;
}

@keyframes circleGrow {
  0% {
    r: 0;
    opacity: 1;
  }
  100% {
    r: 45;
    opacity: 1;
  }
}

@keyframes checkmarkDraw {
  0% {
    stroke-dashoffset: 110;
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
