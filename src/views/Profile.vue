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
    <b-row v-if="!loading">
      <b-col cols="6">
        <b-card>
          <doughnut-chart :chart-data="charts.successRate.chartData"></doughnut-chart>
        </b-card>
      </b-col>
      <b-col cols="6">
        <b-card>
          <bar-chart :chart-data="charts.successByOp"></bar-chart>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6">
        <b-card>
          <random-chart type="line"></random-chart>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import RandomChart from "../components/RandomChart";
import PieChart from "../lib/charts/PieChart.js"
import DoughnutChart from "../lib/charts/DoughnutChart"
import BarChart from "../lib/charts/BarChart"
export default {
  name: "Profile",
  components: {RandomChart, DoughnutChart, BarChart},
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
        },
        successByOp: {
          labels: ["and", "or", "not", "true", "false", "xor", "implication", "eq"],
          datasets: [{
            label: "answered correctly",
            backgroundColor: 'rgb(77, 186, 135)',
            data: []
          },
          {
            label: "answered wrong",
            backgroundColor: 'rgb(255, 99, 132)',
            data: []
          }
          ],
          successCounts: {
            "and": 0, "or": 0, "not": 0, "true": 0, "false": 0, "xor": 0, "implication": 0, "eq":0
          },
          failCounts: {
            "and": 0, "or": 0, "not": 0, "true": 0, "false": 0, "xor": 0, "implication": 0, "eq":0
          }
        }
      },
    };
  },
  methods: {
    getDataSuccessByOps(successTrueByOp, successFalseByOp){
    //increment successCounts for each occurance of successfully answered operators
    console.log("success", successTrueByOp)
    console.log("fail", successFalseByOp)
    console.log("successLength", successTrueByOp.length)
    console.log("type",typeof(successTrueByOp))
    for(let i = 0; i < successTrueByOp.length; i++){
      let currData = successTrueByOp[i]
      console.log("successLength", currData._id.op.length)
      for(let j = 0; j < currData._id.op.length; j++){
        this.charts.successByOp.successCounts[currData._id.op[j]]++
      }
    }

    //do the same for failed operators
    for(let i = 0; i < successFalseByOp.length; i++){
      let currData = successFalseByOp[i]
      for(let j = 0; j < currData._id.op.length; j++){
        this.charts.successByOp.failCounts[currData._id.op[j]]--
      }
    }

    //transfer them to arrays for the bar-chart
    let successArray = [
      this.charts.successByOp.successCounts.and,
      this.charts.successByOp.successCounts.or,
      this.charts.successByOp.successCounts.not,
      this.charts.successByOp.successCounts.true,
      this.charts.successByOp.successCounts.false,
      this.charts.successByOp.successCounts.xor,
      this.charts.successByOp.successCounts.implication,
      this.charts.successByOp.successCounts.eq
    ]

    let failArray = [
      this.charts.successByOp.failCounts.and,
      this.charts.successByOp.failCounts.or,
      this.charts.successByOp.failCounts.not,
      this.charts.successByOp.failCounts.true,
      this.charts.successByOp.failCounts.false,
      this.charts.successByOp.failCounts.xor,
      this.charts.successByOp.failCounts.implication,
      this.charts.successByOp.failCounts.eq
    ]

    this.charts.successByOp.datasets[0].data = successArray
    this.charts.successByOp.datasets[1].data = failArray
    }
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

        if(successTrue[0] && successTrue[0].hasOwnProperty("frequency") && successFalse[0] && successFalse[0].hasOwnProperty("frequency")){
            this.charts.successRate.chartData.datasets[0].data.push(successTrue[0].frequency)
            this.charts.successRate.chartData.datasets[0].data.push(successFalse[0].frequency)
        }

        if(successTrueByOp[0] && successTrueByOp[0].hasOwnProperty("_id") && successFalseByOp[0] && successFalseByOp[0].hasOwnProperty("_id")){
            this.getDataSuccessByOps(successTrueByOp, successFalseByOp)
        }

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