<template>
  <div>
    <h1>App Dashboard</h1>
    <hr/>
    <b-row>
      <b-col cols="6">
        <h2>Runs Started (last 30 days):</h2>
        <random-chart></random-chart>
      </b-col>
      <b-col cols="6">
        <h2>Another Graph:</h2>
        <random-chart></random-chart>
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