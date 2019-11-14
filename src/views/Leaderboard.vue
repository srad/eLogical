<template>
  <div class="leaderboard">
    <h1>Leaderboard</h1>
    <b-row v-for="entry in leaderboardEntries">
      <b-col>
        <p>{{entry.id}} - {{entry.name}} - {{entry.points}}</p>
      </b-col>
    </b-row>
  </div>
</template>


<script>
import APIService from "../services/APIService";
export default {
  name: "Leaderboard",
  data() {
    return {
      leaderboardEntries: []
    };
  },
  mounted() {
    this.loadLeaderboardEntries();
  },
  methods: {
    loadLeaderboardEntries() {
      APIService.getLeaderboardEntries().then(response => {
        console.log("RESPONSE: " + response);
        this.leaderboardEntries = response.table;
      });
    }
  }
};
</script>