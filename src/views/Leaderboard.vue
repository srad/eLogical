<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="align-middle">High Score</h1>
      <font-awesome-icon icon="trophy" class="fa-3x m-1 text-warning float-end"/>
    </div>
    <br/>
    <div class="row">
      <div class="col text-center">
        <div v-if="loading" class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <logic-table v-else :fields="fields" :items="entries" header="High Score"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useApi } from "@/composables/useApi";
import LogicTable from "../components/LogicTable.vue";
import { LeaderboardResponse } from "@/services/elogical.ts";
import { GameScore } from "@/services/localStorage.ts";

interface LeaderboardEntry {
  No: number;
  Score: number;
}

interface TableField {
  key: string;
}

const api = useApi();
const loading = ref<boolean>(true);
const fields = ref<TableField[]>([ { key: "No" }, { key: "Score" } ]);
const entries = ref<LeaderboardEntry[]>([]);

onMounted(async () => {
  try {
    if (!api) {
      throw new Error("API not available");
    }
    const response: LeaderboardResponse = await api.getUserHighScores();
    entries.value = response.data.map((item: GameScore, i: number) => {
      return {
        No: i + 1,
        Score: (item.total as number) ?? 0,
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
