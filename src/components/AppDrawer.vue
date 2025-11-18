<template>
  <!-- Backdrop Overlay -->
  <div
    v-show="isOpen"
    class="drawer-backdrop"
    @click="$emit('close')"
  ></div>

  <!-- Side Drawer Menu -->
  <div :class="['drawer', { 'drawer-open': isOpen }]">
    <div class="drawer-header">
      <h5 class="m-0">Menu</h5>
      <button
        class="btn-close btn-close-white"
        aria-label="Close menu"
        @click="$emit('close')"
      ></button>
    </div>
    <div class="drawer-content">
      <div class="drawer-menu">
        <router-link
          v-for="route in menuItems"
          :key="route.path"
          :to="route.path"
          class="drawer-item"
          :class="{ 'drawer-item-active': currentRoute === route.path }"
          @click="$emit('close')"
        >
          {{ route.meta?.title }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();

const router = useRouter();
const route = useRoute();

const menuItems = computed(() => {
  return router.getRoutes();
});

const currentRoute = computed(() => {
  return route.path;
});
</script>

<style scoped>
/* Drawer Backdrop */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
}

/* Side Drawer */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.drawer.drawer-open {
  transform: translateX(0);
}

/* Drawer Header */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2abb79 0%, #1e8a5c 100%);
  color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.drawer-header h5 {
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
}

.btn-close {
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: white;
}

.btn-close:hover {
  opacity: 0.8;
}

/* Drawer Content */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0.5rem;
}

/* Drawer Menu Items */
.drawer-menu {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.drawer-item {
  display: block;
  padding: 1rem 1.5rem;
  color: #333;
  text-decoration: none;
  border-left: 4px solid transparent;
  transition: all 0.2s ease-in-out;
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}

.drawer-item:hover {
  background-color: #f5f5f5;
  color: #2abb79;
  border-left-color: #2abb79;
}

.drawer-item-active {
  background-color: #e8f5e9;
  color: #2abb79;
  border-left-color: #2abb79;
  font-weight: 600;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
