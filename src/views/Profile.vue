<template>
  <div>
    <h1>My Profile</h1>
    <hr/>
    <b-row>
      <b-col>
        <div class="text-center" v-if="loading">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading"/>
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
    <b-row v-if="!loading">
      <b-col>
        <b-card>
          <pie-chart :chart-data="charts.successRate.chartData"></pie-chart>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import RandomChart from "../components/RandomChart";
import PieChart from "../lib/charts/PieChart.js"

export default {
  name: "Profile",
  components: {RandomChart, PieChart},
  data() {
    return {
      loading: true,
      entry: undefined,
      hasScore: false,
      localusername: localStorage.username,
      charts: {
        pointsHistory: {
          chartData: {
            labels: ["20.01.2020", "21.01.2020", "22.01.2020", "23.01.2020", "24.01.2020", "25.01.2020"],
            data: [15, 12, 17, 25, 26, 26],
          },
          options: {},
        },
        successRate: {
          chartData: {
            labels: ["right", "wrong"],
            datasets: [
              {
                backgroundColor: ["#00cc00","#cc0000"],
                data: []
              }
            ]
          }
        }
      },
    };
  },
  mounted() {
    Promise.all([this.$api.getStats(), this.$api.getTracker()])
      .then(response => {
        const stats = response[0];
        const tracker = response[1].data;
        // Frequency of total number correctly answered
        const successTrue = tracker.groupBySuccess.filter(t => t._id.success);
        // Frequency of total number wrongly answered
        const successFalse = tracker.groupBySuccess.filter(t => !t._id.success);
        // Frequency of total numbers correctly answered of a certain operator sequence
        const successTrueByOp = tracker.groupBySuccessAndOp.filter(t => t._id.success);
        // Frequency of total numbers wrongly answered of a certain operator sequence
        const successFalseByOp = tracker.groupBySuccessAndOp.filter(t => t._id.success);

        console.log(successTrue);
        console.log(successFalse);
        console.log(successTrueByOp);
        console.log(successFalseByOp);

        this.charts.successRate.chartData.datasets[0].data.push(successTrue[0].frequency)
        this.charts.successRate.chartData.datasets[0].data.push(successFalse[0].frequency)

        this.loading = false;
        if (stats.data.length > 0) {
          this.hasScore = stats.data.length > 0;
          if (this.hasScore) {
            this.entry = stats.data[0];
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