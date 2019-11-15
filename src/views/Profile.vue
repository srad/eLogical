<template>
  <div class="mt-3">
    <h1 class="mb-3">My Profile</h1>
    <b-row>
      <b-col>
        <div class="text-center" v-if="loading">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading"/>
        </div>
        <div v-else>
          <h4>
            You username is
            <b-badge variant="info">{{this.username}}</b-badge>
          </h4>
          <h4 v-if="hasScore">
            Your score is
            <b-badge variant="warning">{{entry.Score}}</b-badge>
          </h4>
          <h4 v-else>
            You don't have any score yet!
          </h4>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "Profile",
  data() {
    return {
      loading: true,
      entry: undefined,
      username: window.localStorage.getItem("username"),
      hasScore: false,
    };
  },
  mounted() {
    this.$api.getLeaderBoard()
      .then(response => {
        this.loading = false;
        if (response.data.length > 0) {
          const item = response.data
            .filter(item => item.client[0].name === window.localStorage.getItem("username"))
            .map(item => ({Score: item.total, Client: item.client[0].name}));
          this.hasScore = item.length > 0;
          if (this.hasScore) {
            this.entry = item[0];
          }
        }
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  },
};
</script>