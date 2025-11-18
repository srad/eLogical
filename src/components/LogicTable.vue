<template>
  <div class="card logic-table shadow-sm border-primary">
    <div class="card-header bg-primary text-white pt-2 pb-0 ps-2">
      <h5 v-html="header"></h5>
    </div>
    <div class="card-body p-0">
      <table class="table table-bordered table-striped mb-0">
        <thead>
          <tr>
            <th v-for="field in fields" :key="field.key" v-html="field.label || field.key"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td v-for="field in fields" :key="field.key" v-html="item[field.key]"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Field {
  key: string;
  label?: string;
  sortable?: boolean;
  class?: string;
}

interface Props {
  fields: Field[];
  items: Record<string, any>[];
  header: string;
}

defineProps<Props>();
</script>

<style scoped></style>
