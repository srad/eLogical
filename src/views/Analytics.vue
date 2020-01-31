<template>
  <b-container class="text-center">
    <h1>App Dashboard</h1>
    <hr/>
    <b-row>
      <b-col>
        <b-card>
          <h2>Runs completed:</h2>
          <span>504</span>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <h2>Avg. Runs per user:</h2>
          <span>38</span>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <h2>Total Levels completed</h2>
          <span>10215</span>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6">
        <b-card>
          <h2>Deaths by difficulty:</h2>
          <random-chart type="bar"></random-chart>
        </b-card>
      </b-col>
      <b-col cols="6">
        <b-card>
          <h2>Another Graph:</h2>
          <random-chart type="line"></random-chart>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="m-t">
      <b-col cols="6">
        <b-card>
          <h2>Mistakes by Operator:</h2>
          <random-chart type="doughnut"></random-chart>
        </b-card>
      </b-col>
      <b-col cols="6">
        <b-card>
          <h2>Rewards Selected:</h2>
          <random-chart type="doughnut"></random-chart>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import RandomChart from '../components/RandomChart'
export default {
  name: "Profile",
  components: {RandomChart},
  data() {
    return {
      loading: true,
      charts: {
        pointsHistory: {
          chartData: {
            labels: ['20.01.2020','21.01.2020','22.01.2020','23.01.2020','24.01.2020','25.01.2020'],
            datasets: [15, 12, 17, 25, 26, 26]
          },
          options: {

          }
        },
        difficultyComparison:{
          chartData: {
            datasets: [{
              barPercentage: 0.5,
              barThickness: 6,
              maxBarThickness: 8,
              minBarLength: 2,
              data: [10, 20, 30, 40, 50, 60, 70]
            }]
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