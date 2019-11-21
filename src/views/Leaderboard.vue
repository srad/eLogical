<template>
  <div>
    <b-row>
      <b-col><h1 class="align-middle">Leaderboard</h1></b-col>
      <b-col>
        <font-awesome-icon icon="trophy" class="fa-3x m-1 text-warning float-right"/>
      </b-col>
    </b-row>
    <hr/>
    <b-row>
      <b-col class="text-center">
        <b-spinner v-if="loading" style="width: 3rem; height: 3rem;" variant="primary" label="Loading"/>
        <logic-table v-else :fields="fields" :items="entries" header="Top 10 Players"/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LogicTable from "../components/LogicTable";

export default {
  name: "Leaderboard",
  components: {
    "logic-table": LogicTable,
  },
  data() {
    return {
      loading: true,
      fields: [{key: "No"}, {key: "Score"}, {key: "Client"}],
      entries: [],
    };
  },
  mounted() {
    this.$api
      .getLeaderBoard()
      .then(response => {
        this.loading = false;
        this.entries = response.data.map((item, i) => ({
          No: i + 1,
          Score: item.total,
          Client: item.client[0].name,
        }));
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  },
};
</script>