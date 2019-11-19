<template>
  <b-card class="logic-table shadow-sm" bg-variant="primary" body-bg-variant="white" body-class="p-0" header-class="pt-2 pb-0 pl-2 text-white">
    <template v-slot:header>
      <h5 v-html="header"></h5>
    </template>
    <b-card-body body-class="p-0">
      <b-table bordered striped :items="items" :fields="fields" class="mb-0">
        <template v-slot:head()="data">
          <span v-html="data.label"></span>
        </template>
      </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  name: "LogicTable",
  props: {
    fields: Array,
    items: Array,
    header: String,
    headerLabels: Array,
  },
};
</script>

<style scoped>
</style>