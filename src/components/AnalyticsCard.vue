<template>
  <div class="card shadow-sm h-100" style="min-width: 0">
    <div class="card-body d-flex flex-column" style="min-width: 0">
      <h2 class="card-title text-primary mb-3">{{ title }}</h2>
      <div v-if="loading" class="d-flex justify-content-center align-items-center flex-grow-1">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="flex-grow-1 d-flex flex-column justify-content-center" style="min-height: 0; min-width: 0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

:deep(.card-body) {
  min-width: 0;
  overflow: hidden;
}
</style>
