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
            <b-badge variant="info" v-if='hasScore'>{{entry.client.name}}</b-badge>
            <b-badge variant="info" v-else>{{localusername}}</b-badge>
          </h5>
          <h5 v-if="hasScore">
            Your highscore is
            <b-badge variant="warning">{{entry.total}}</b-badge>
          </h5>
          <h4 v-else>You don't have a highscore yet!</h4>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6">
        <random-chart type="line"></random-chart>
      </b-col>
      <b-col cols="6">
        <random-chart type="bar"></random-chart>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import RandomChart from '../components/RandomChart'
export default {
  name: "Profile",
  components: {RandomChart},
  data() {
    return {
      loading: true,
      entry: undefined,
      hasScore: false,
      localusername: localStorage.username,
      charts: {
        pointsHistory: {
          chartData: {
            labels: ['20.01.2020','21.01.2020','22.01.2020','23.01.2020','24.01.2020','25.01.2020'],
            data: [15, 12, 17, 25, 26, 26]
          },
          options: {

          }
        }
      }
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