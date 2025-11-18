<template>
  <div class="d-flex gap-1">
    <font-awesome-icon
      v-for="(_, index) in localMax"
      :key="index"
      :size="localSize"
      :class="getIconClasses(index)"
      class="animated fast"
      :style="getIconStyle(index)"
      :icon="localIcon"
      @click="$emit('click')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, onMounted, ref, watch } from 'vue';

interface RessourceProps {
  animate?: boolean;
  showAnimation?: string;
  hideAnimation?: string;
  showAnimationClass?: string;
  hideAnimationClass?: string;
  delay?: number;
  max?: number;
  size?: string;
  current?: number;
  icon?: string;
  color?: string;
}

const props = withDefaults(defineProps<RessourceProps>(), {
  animate: false,
  delay: 400,
  size: '2x',
});

const emit = defineEmits<{
  click: [];
}>();

// Reactive state
const rendered = ref<boolean>(false);
const animatingIndex = ref<number | null>(null);
const localCurrent = ref<number>(props.current ?? 0);

// Computed properties for local values with defaults
const localAnimate = computed<boolean>(() => props.animate ?? false);
const localShowAnimationClass = computed<string>(
  () => props.showAnimationClass || 'zoomIn'
);
const localHideAnimationClass = computed<string>(
  () => props.hideAnimationClass || 'swing'
);
const localDelay = computed<number>(() => props.delay ?? 400);
const localMax = computed<number>(() => props.max ?? 0);
const localSize = computed<string>(() => props.size || '2x');
const localIcon = computed<string | undefined>(() => props.icon);
const localColor = computed<string | undefined>(() => props.color);

// Watch for changes in current prop
watch(
  () => props.current,
  (val: number | undefined) => {
    if (val === undefined) return;

    if (localAnimate.value && val < localMax.value) {
      // Set the animating icon index
      animatingIndex.value = val;

      // After animation completes, update localCurrent and reset animatingIndex
      setTimeout(() => {
        localCurrent.value = val;
        animatingIndex.value = null;
      }, 1500);
    } else {
      localCurrent.value = val;
    }
  }
);

// Methods
const getIconClasses = (index: number): Record<string, boolean> => {
  const isInactive = index >= localCurrent.value;
  const isAnimating = animatingIndex.value === index;

  return {
    'text-secondary': isInactive,
    [localShowAnimationClass.value]: !rendered.value && !isAnimating,
    [localHideAnimationClass.value]: isAnimating,
    pulsating:
      (props.current ?? 0) === 1 && props.icon === 'heart' && index === 0,
  };
};

const getIconStyle = (index: number): CSSProperties => {
  return {
    color: localColor.value,
    animationDelay: rendered.value
      ? undefined
      : `${(index + 1) * localDelay.value}ms`,
  } as CSSProperties;
};

// Lifecycle
onMounted(() => {
  setTimeout(
    () => {
      rendered.value = true;
    },
    localMax.value * localDelay.value * 2
  );
});
</script>
<style scoped>
.pulsating {
  animation: pulsate 1s;
  animation-iteration-count: infinite;
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
</style>
