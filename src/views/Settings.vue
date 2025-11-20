<template>
  <div class="d-flex flex-column gap-3">
    <!-- Database Size Section -->
    <div class="settings-card ">
      <h5>Database Storage</h5>
      <p class="text-muted">Current database size</p>
      <div class="alert alert-info">
        <strong>{{ dbSizeFormatted }}</strong>
      </div>
      <br/>
      <button class="btn btn-sm btn-outline-primary" @click="refreshDatabaseSize" :disabled="isLoadingSize">
        <span v-if="!isLoadingSize">Refresh Size</span>
        <span v-else>
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading...
          </span>
      </button>
    </div>

    <!-- Tracking Section -->
    <div class="settings-card">
      <h5>Data Tracking</h5>
      <p class="text-muted">Allow tracking of gameplay events for analytics</p>
      <div class="form-check form-switch d-flex gap-1 align-items-center">
        <input
            class="form-check-input"
            type="checkbox"
            id="trackingToggle"
            v-model="trackingEnabled"
            @change="updateTracking"
        />
        <label class="form-check-label" for="trackingToggle">
          {{ trackingEnabled ? "Tracking Enabled" : "Tracking Disabled" }}
        </label>
      </div>
      <small class="text-muted d-block mt-2">
        Disable this to stop recording gameplay events. Existing data will not be affected.
      </small>
    </div>

    <!-- Clear Data Section -->
    <div class="settings-card">
      <h5>Danger Zone</h5>
      <p class="text-muted">Permanently delete all data</p>
      <div v-if="!showClearConfirmation">
        <button class="btn btn-danger" @click="openClearConfirmation">
          Clear All Data
        </button>
      </div>
      <div v-else class="alert alert-warning">
        <p class="mb-3"><strong>Are you sure you want to delete all data?</strong></p>
        <p class="text-muted mb-3">This action cannot be undone. All game scores, tracking events, and preferences will be permanently deleted.</p>
        <div class="d-flex gap-2">
          <button class="btn btn-danger" @click="clearAllData" :disabled="isClearing">
            <span v-if="!isClearing">Yes, Delete All</span>
            <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </span>
          </button>
          <button class="btn btn-secondary" @click="cancelClearConfirmation" :disabled="isClearing">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { localStorageService } from "../services/localStorage";

const dbSize = ref(0);
const isLoadingSize = ref(false);
const showClearConfirmation = ref(false);
const isClearing = ref(false);
const trackingEnabled = ref(true);

const dbSizeFormatted = computed(() => {
  if (dbSize.value === 0) return "0 B";

  const units = [ "B", "KB", "MB", "GB" ];
  let size = dbSize.value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
});

const refreshDatabaseSize = async () => {
  isLoadingSize.value = true;
  try {
    const leaderboardEvents = await localStorageService.getAllTrackingEvents();
    const leaderboardData = await localStorageService.getLeaderboard(1000);

    const size = JSON.stringify({
      tracking: leaderboardEvents,
      leaderboard: leaderboardData,
    }).length;

    dbSize.value = size;
  } catch (error) {
    console.error("Failed to calculate database size:", error);
  } finally {
    isLoadingSize.value = false;
  }
};

const openClearConfirmation = () => {
  showClearConfirmation.value = true;
};

const cancelClearConfirmation = () => {
  showClearConfirmation.value = false;
};

const clearAllData = async () => {
  isClearing.value = true;
  try {
    await localStorageService.clearAll();
    dbSize.value = 0;
    showClearConfirmation.value = false;
    // Show success message
    alert("All data has been deleted successfully.");
  } catch (error) {
    console.error("Failed to clear data:", error);
    alert("Failed to delete data. Please try again.");
  } finally {
    isClearing.value = false;
  }
};

const updateTracking = () => {
  const value = trackingEnabled.value ? "true" : "false";
  localStorage.trackingAllowed = value;
};

onMounted(() => {
  // Load tracking preference
  const trackingAllowed = localStorage.trackingAllowed !== "false";
  trackingEnabled.value = trackingAllowed;

  // Load database size
  refreshDatabaseSize();
});
</script>

<style scoped>
.settings {
  padding: 1rem;
}

.settings-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.settings-card h5 {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-check-input {
  width: 3em;
  height: 1.5em;
  margin-top: 0.25rem;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.alert {
  border-radius: 6px;
}

.btn {
  border-radius: 6px;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}
</style>
