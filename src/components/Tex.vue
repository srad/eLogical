<template>
  <div ref="texElement"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import katex from 'katex';

interface TexProps {
  expression?: string;
}

const props = defineProps<TexProps>();

const texElement = ref<HTMLDivElement | null>(null);

// Watch for changes in expression and re-render
watch(
  () => props.expression,
  (newExpression: string | undefined) => {
    if (newExpression && texElement.value) {
      try {
        katex.render(newExpression, texElement.value);
      } catch (error) {
        console.error('KaTeX rendering error:', error);
      }
    }
  },
  {
    immediate: true,
  }
);
</script>

<style>
@import 'katex/dist/katex.min.css';

.katex {
  font-size: 1.2em;
}
</style>
