<template>
  <div>
    <h1>Leaderboard</h1>
    <hr />
    <b-row>
      <b-col>
        <logic-table :fields="fields" :items="entries" header="Top Players" />
        <p v-if="loading">Loading ...</p>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LogicTable from "../components/LogicTable";

export default {
  name: "Leaderboard",
  components: {
    "logic-table": LogicTable
  },
  data() {
    return {
      loading: true,
      fields: [
        {
          key: "Score"
        },
        {
          key: "Client"
        }
      ],
      entries: []
    };
  },
  mounted() {
    this.$api
      .getLeaderBoard()
      .then(response => {
        this.loading = false;
        this.entries = response.data.map(item => ({
          Score: item.total,
          Client: item.client[0].name
        }));
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  }
};
</script>