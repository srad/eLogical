<template>
  <div v-if="isVisible" class="feedback-overlay" @click="$emit('hide')">
    <div class="feedback-content">
      <div class="feedback-icon">
        <!-- Animated checkmark for correct answer -->
        <checkmark-animation v-if="isCorrect" />
        <!-- X icon for wrong answer -->
        <font-awesome-icon v-else icon="times-circle" class="icon-wrong" />
      </div>
      <h2 class="feedback-text" :class="{ 'text-correct': isCorrect, 'text-wrong': !isCorrect }">
        {{ isCorrect ? "CORRECT!" : "WRONG!" }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
import CheckmarkAnimation from "./CheckmarkAnimation.vue";
import { soundService, SoundType } from "@/services/soundService.ts";

interface Props {
  isVisible: boolean;
  isCorrect: boolean;
}

const props = defineProps<Props>();
defineEmits<{
  hide: [];
}>();

// Play sound when feedback is shown
watch(
  () => [props.isVisible, props.isCorrect] as const,
  ([isVisible, isCorrect]) => {
    if (isVisible) {
      const track = isCorrect ? SoundType.CORRECT : SoundType.WRONG;
      soundService.play(track);
    }
  }
);
</script>

<style scoped>
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.feedback-content {
  text-align: center;
  position: relative;
  z-index: 2001;
  padding: 2rem;
}

.feedback-icon {
  font-size: 6rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrong {
  color: #dc3545;
  text-shadow: 0 0 20px rgba(220, 53, 69, 0.6);
  animation: iconBounce 0.6s ease-in-out infinite;
}

.feedback-text {
  font-size: 8vw;
  font-weight: bold;
  margin: 1.5rem 0 0 0;
  letter-spacing: 2px;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.feedback-text.text-correct {
  background-color: #28a745;
}

.feedback-text.text-wrong {
  background-color: #dc3545;
}

.text-correct {
  color: white;
  animation: correctPulse 0.6s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.4);
}

.text-wrong {
  color: white;
  animation: wrongShake 0.4s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.4);
}

@keyframes iconBounce {
  0% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.15) translateY(-10px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes wrongShake {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-5px) rotate(-2deg);
  }
  75% {
    transform: translateX(5px) rotate(2deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
</style>
