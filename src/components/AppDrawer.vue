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
      <h5 class="m-0 p-1 d-flex justify-content-between align-items-center gap-2">
        <span>eLogical</span>
        <font-awesome-icon icon="robot" size="1x" class="robot-icon" />
      </h5>
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
  z-index: 10000;
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
  /* The icon's navy backdrop, matching the navbar and card headers. White reads 12.4:1. */
  background: var(--el-gradient);
  color: #fff;
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
  /* btn-close-white inverts Bootstrap's glyph for the dark navy header. */
  color: #fff;
}

.btn-close:hover {
  opacity: 0.8;
}

/* Drawer Content */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0.5rem;
  /* The drawer is position:fixed and spans to bottom:0, so it sits outside #app-root's
     padding and needs the nav-bar inset of its own to keep the last item reachable. */
  padding-bottom: var(--el-safe-bottom);
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
  /* The accents manage only ~2.7:1 as text on these near-white rows, so the label takes
     the navy ink (11.9:1) and the accent stays where it works: as a decorative fill. */
  color: var(--el-ink);
  border-left-color: var(--el-cyan);
}

.drawer-item-active {
  /* A 10% tint of the icon's cyan (navy ink on it reads 11.1:1). Distinct from the
     neutral grey hover above, so "selected" and "hovered" stay tellable apart. */
  background-color: #e6f6f8;
  color: var(--el-ink);
  border-left-color: var(--el-cyan);
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
