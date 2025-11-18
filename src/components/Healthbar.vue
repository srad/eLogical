<template>
  <div>
    <font-awesome-icon
      v-for="i in current"
      :key="i"
      :class="{
        pulsating: current === 1,
        despawning: despawningIndex === i,
      }"
      size="2x"
      class="mr-1 heart"
      icon="heart"
      @animationend="handleAnimationEnd(i)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface HealthbarProps {
  current?: number;
}

const props = withDefaults(defineProps<HealthbarProps>(), {
  current: 0,
});

const emit = defineEmits<{
  'damage-taken': [];
}>();

// Reactive state
const despawningIndex = ref<number | null>(null);

/**
 * Trigger the despawn animation for the current health value
 * This should be called when damage is taken
 */
const despawnLife = (): void => {
  if (navigator.vibrate) {
    navigator.vibrate(250);
  }
  despawningIndex.value = props.current;
};

/**
 * Handle animation end event
 */
const handleAnimationEnd = (index: number): void => {
  if (despawningIndex.value === index) {
    emit('damage-taken');
    despawningIndex.value = null;
  }
};

// Expose despawnLife method for parent components
defineExpose({
  despawnLife,
});
</script>

<style scoped>
.heart {
  color: darkred;
  animation: slideInFromRight 1s;
  animation-delay: 1.5s;
  animation-fill-mode: backwards;
}
.pulsating {
  animation: pulsate 1s;
  animation-iteration-count: infinite;
}
.despawning {
  animation: despawn 1s;
}
@keyframes pulsate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes despawn {
  25% {
    transform: scale(1.5);
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  60% {
    transform: scale(1.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.5);
    opacity: 1;
  }
  80% {
    transform: scale(1.5);
    opacity: 0;
  }
  90% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
@keyframes slideInFromRight {
  from {
    transform: translateX(3em);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
