<template>
  <div>
    <h1>My Profile</h1>
    <hr/>
    <b-row>
      <b-col>
        <div class="text-center" v-if="loading">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" />
        </div>
        <div v-else>
          <h5>
            Your username is
            <b-badge variant="info">{{entry.client.name}}</b-badge>
          </h5>
          <h5 v-if="hasScore">
            Your score is
            <b-badge variant="warning">{{entry.total}}</b-badge>
          </h5>
          <h4 v-else>You don't have any score yet!</h4>
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
      hasScore: false,
    };
  },
  mounted() {
    this.$api
      .getStats()
      .then(response => {
        this.loading = false;
        if (response.data.length > 0) {
          this.hasScore = response.data.length > 0;
          if (this.hasScore) {
            this.entry = response.data[0];
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