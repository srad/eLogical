<template>
  <div class="home">
    <!-- Main content -->
    <div class="home-content">
      <h1 class="welcome-title">Welcome to</h1>
      <font-awesome-icon icon="robot" size="5x" class="robot-icon" />
      <h1 class="app-title">eLogical</h1>

      <div class="start-section">
        <p class="disclaimer">
          eLogical is a boolean formula solving game
        </p>
        <router-link to="/game" class="text-decoration-none">
          <button class="btn btn-outline-light btn-lg start-button">
            Start Game
          </button>
        </router-link>
      </div>
    </div>

    <!-- Modal dialog -->
    <div class="modal fade" ref="modalElement" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Welcome!</h5>
          </div>
          <div class="modal-body">
            <p class="text-center mb-4">
              Welcome to eLogical! To improve your experience we track
              anonymous data from activities of our users. Are you ok with
              that?
            </p>
            <div class="button-group">
              <button
                class="btn btn-success btn-lg flex-grow-1"
                @click="setTrackingPreferances(true)"
              >
                Sure
              </button>
              <button
                class="btn btn-danger btn-lg flex-grow-1 ms-2"
                @click="setTrackingPreferances(false)"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';

interface HomeState {
  trackingAsked: boolean;
  modal: Modal | null;
}

const state = ref<HomeState>({
  trackingAsked: false,
  modal: null,
});

const modalElement = ref<HTMLDivElement | null>(null);

/**
 * Set user's tracking preferences
 */
const setTrackingPreferances = (val: boolean): void => {
  localStorage.trackingAllowed = val ? 'true' : 'false';
  state.value.trackingAsked = true;
  state.value.modal?.hide();
};

// Lifecycle
onMounted(() => {
  if (!modalElement.value) return;

  // Initialize Bootstrap modal
  state.value.modal = new Modal(modalElement.value, {
    backdrop: 'static',
    keyboard: false,
  });

  if (!localStorage.trackingAllowed && !state.value.trackingAsked) {
    state.value.modal.show();
  }
});
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background-color: var(--bs-primary);
  color: white;
  padding: 2rem 1rem;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-title {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.robot-icon {
  margin: 1rem 0;
  opacity: 0.9;
}

.app-title {
  font-size: 4rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.start-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  margin-top: 2rem;
}

.disclaimer {
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.disclaimer-link {
  color: var(--bs-warning);
  text-decoration: underline;
  font-weight: 500;
}

.disclaimer-link:hover {
  color: #ffc107;
}

.start-button {
  width: 100%;
  max-width: 300px;
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
  border-width: 2px;
  transition: all 0.3s ease;
}

.start-button:hover {
  background-color: white;
  color: var(--bs-primary);
  border-color: white;
}

.button-group {
  display: flex;
  gap: 1rem;
}

@media (max-width: 576px) {
  .welcome-title {
    font-size: 1.75rem;
  }

  .app-title {
    font-size: 2.5rem;
  }

  .disclaimer {
    font-size: 0.85rem;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn:not(:first-child) {
    margin-left: 0 !important;
    margin-top: 0.5rem;
  }
}
</style>
