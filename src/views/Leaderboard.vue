<template>
  <div>
    <h1>Leaderboard</h1>
    <b-row>
      <b-col>
        <b-table class="table-white" bordered :items="entries"/>
        <p v-if="loading">
          Loading ...
        </p>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "Leaderboard",
  data() {
    return {
      loading: true,
      entries: [],
    };
  },
  mounted() {
    this.$api.getLeaderBoard()
      .then(response => {
        this.loading = false;
        this.entries = response.data.map(item => ({Score: item.total, Client: item.client[0].name}));
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  },
};
</script>