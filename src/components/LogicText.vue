<template>
  <div class="logic-text m-0 p-0" v-html="expression"></div>
</template>

<script setup lang="ts">
interface TexProps {
  expression?: string;
}

defineProps<TexProps>();
</script>

<style scoped>
.logic-text {
  font-size: 1.4em;
  font-family: 'EB Garamond', 'Latin Modern Math', 'STIX Two Math', 'Cambria Math', 'Times New Roman', serif;
  font-weight: 400;
  display: inline-block;
}

.logic-text :deep(.op) {
  display: inline-block;
}

.logic-text :deep(.var) {
  font-style: italic;
  font-weight: 400;
}

.logic-text :deep(sub) {
  font-size: 0.75em;
  font-style: normal;
  vertical-align: sub;
  line-height: 0;
}

.logic-text :deep(.paren) {
  font-style: normal;
  font-weight: 400;
}
</style>
