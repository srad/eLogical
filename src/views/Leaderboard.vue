<template>
  <div>
    <div class="row">
      <div class="col"><h1 class="align-middle">High Score</h1></div>
      <div class="col">
        <font-awesome-icon icon="trophy" class="fa-3x m-1 text-warning float-end" />
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col text-center">
        <div v-if="loading" class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <logic-table v-else :fields="fields" :items="entries" header="All High Scores" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useApi } from "@/composables/useApi";
import LogicTable from "../components/LogicTable.vue";

interface LeaderboardEntry {
  No: number;
  Score: number;
  Client: string;
}

interface TableField {
  key: string;
}

const api = useApi();
const loading = ref<boolean>(true);
const fields = ref<TableField[]>([{ key: "No" }, { key: "Score" }]);
const entries = ref<LeaderboardEntry[]>([]);

onMounted(async () => {
  try {
    if (!api) {
      throw new Error("API not available");
    }
    const response = await api.getUserHighScores();
    entries.value = response.data.map((item: Record<string, unknown>, i: number) => {
      return {
        No: i + 1,
        Score: (item.total as number) ?? 0,
        Client: ((item.client as Array<Record<string, unknown>>)?.[0]?.name as string) ?? "Unknown",
      };
    });
  } catch (error) {
    console.error("Failed to load high scores:", error);
    alert(`Error loading high scores: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
});
</script>
