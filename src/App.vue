<template>
  <div id="app">
    <!-- Top Navigation Bar -->
    <nav class="navbar bg-primary sticky-top">
      <div class="container-fluid">
        <!-- Mobile/Tablet Toggle Button -->
        <button
            class="navbar-toggler ms-0 navbar-toggler-mobile"
            type="button"
            aria-label="Toggle navigation menu"
            @click="isMenuOpen = !isMenuOpen"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Brand -->
        <router-link to="/" class="navbar-brand fw-bold text-white d-flex gap-3 align-items-center flex-grow-1 justify-content-center navbar-brand-mobile">
          <span>eLogical</span>
          <font-awesome-icon icon="robot"/>
        </router-link>

        <!-- Spacer to balance layout on mobile -->
        <div class="navbar-spacer"></div>

        <!-- Desktop Menu (hidden on mobile) -->
        <ul class="navbar-nav ms-auto navbar-menu-desktop">
          <li v-for="route in menuItems" :key="route.path" class="nav-item">
            <router-link
                :to="route.path"
                class="nav-link text-white"
                :class="{ active: $route.path === route.path }"
            >
              {{ route.meta?.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- App Drawer Component -->
    <AppDrawer :isOpen="isMenuOpen" @close="isMenuOpen = false"/>

    <div class="app-container vh-100" style="background-color: #f8f9fa">
      <RouterView/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import AppDrawer from "./components/AppDrawer.vue";

const router = useRouter();
const isMenuOpen = ref(false);

const menuItems = computed(() => {
  return router.getRoutes();
});
</script>

<style scoped>
/* Navbar Styling */
.navbar {
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-toggler-mobile {
  padding: 0.5rem 1rem;
  border: none;
  margin-left: 0;
}

.navbar-toggler-mobile:focus {
  box-shadow: none;
  outline: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2.5' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
  width: 1.5rem;
  height: 1.5rem;
}

/* Mobile/Tablet layout */
.navbar-toggler-mobile {
  display: block;
}

.navbar-brand-mobile {
  flex-grow: 1;
  justify-content: center;
}

.navbar-spacer {
  width: 40px;
}

.navbar-menu-desktop {
  display: none;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* App Container */
.app-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.app-container > :deep(:first-child):not([class*='home']) {
  padding: 1rem;
}

/* Responsive for tablets and up (show traditional menu) */
@media (min-width: 768px) {
  .navbar-toggler-mobile {
    display: none !important;
  }

  .navbar-brand-mobile {
    flex-grow: 0;
    justify-content: flex-start;
  }

  .navbar-spacer {
    display: none;
  }

  .navbar-menu-desktop {
    display: flex !important;
  }
}
</style>
