<template>
  <div v-if="isVisible" class="game-start-overlay">
    <div class="game-start-content">
      <img src="/img/icons/icon.png" alt="eLogical Logo" class="img-fluid" style="max-width: 300px"/>
      <button class="btn btn-lg btn-light game-start-button" @click="$emit('start')">Start Game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isVisible: boolean;
}>();

defineEmits<{
  start: [];
}>();
</script>

<style scoped>
.game-start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #2abb79;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1020;
}

.game-start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.game-start-title {
  font-size: 4rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.game-start-button {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.game-start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.game-start-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .game-start-title {
    font-size: 3rem;
  }

  .game-start-button {
    padding: 0.875rem 2.5rem;
    font-size: 1.25rem;
  }
}
</style>
