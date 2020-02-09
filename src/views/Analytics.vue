<template>
  <b-container class="text-center">
    <h1>App Dashboard</h1>
    <hr />
    <b-row class="mb-4">
      <b-col>
        <b-card>
          <h2>Runs completed:</h2>
          <span id="spanRunsCompleted"></span>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <h2>Avg. Runs per user:</h2>
          <span id="spanAvgRuns"></span>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <h2>Levels completed</h2>
          <span id="spanLevelsCompleted"></span>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="mb-4" v-if="!loading">
      <b-col>
        <b-card>
          <h2>Game Over by difficulty:</h2>
          <bar-chart :chart-data="charts.difficultyComparison"></bar-chart>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="mb-4" v-if="!loading">
      <b-col>
        <b-card>
          <h2>Games played by date:</h2>
          <bar-chart :chart-data="charts.gamesByDate"></bar-chart>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="m-t" v-if="!loading">
      <b-col cols="6">
        <b-card>
          <h2>Mistakes by Operator:</h2>
          <doughnut-chart :chart-data="charts.mistakesByOperator"></doughnut-chart>
        </b-card>
      </b-col>
      <b-col cols="6">
        <b-card>
          <h2>Rewards Selected:</h2>
          <doughnut-chart :chart-data="charts.rewardsSelected"></doughnut-chart>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import BarChart from "../lib/charts/BarChart";
import DoughnutChart from "../lib/charts/DoughnutChart";
export default {
  name: "Profile",
  components: { DoughnutChart, BarChart },
  data() {
    return {
      loading: true,
      charts: {
        difficultyComparison: {
          labels: [],
          datasets: [
            {
              label: `Number of "Game Over"s`,
              backgroundColor: "rgb(77, 186, 135)",
              data: []
            }
          ]
        },
        gamesByDate: {
          labels: [],
          datasets: [
            {
              label: "Number of games played",
              backgroundColor: "rgb(77, 186, 135)",
              data: []
            }
          ]
        },
        mistakesByOperator: {
          labels: [
            "AND",
            "OR",
            "IMPLICATION",
            "NOT",
            "TRUE",
            "FALSE",
            "XOR",
            "EQUAL"
          ],
          datasets: [
            {
              backgroundColor: [
                "#0066ff",
                "#ff00ff",
                "#66ff33",
                "#ff6600",
                "#cc33ff",
                "#33ffff",
                "#ffff33",
                "#ff3333"
              ],
              data: [0, 0, 0, 0, 0, 0, 0, 0]
            }
          ]
        },
        rewardsSelected: {
          labels: ["life", "reroll"],
          datasets: [
            {
              backgroundColor: ["#00cc00", "#cc0000"],
              data: [0, 0]
            }
          ]
        }
      }
    };
  },
  mounted() {
    Promise.all([this.$api.getAnalytics()])
      .then(response => {
        const analytics = response[0].data;
        // console.log("analytics", analytics);

        const runsCompleted = analytics.groupByEvents[1].frequency;
        const avgRuns = runsCompleted / analytics.countUsers;
        const levelsCompleted = analytics.groupBySuccess[1].frequency;

        document.getElementById("spanRunsCompleted").innerText = runsCompleted;
        document.getElementById("spanAvgRuns").innerText = avgRuns;
        document.getElementById(
          "spanLevelsCompleted"
        ).innerText = levelsCompleted;

        const finishedRunsByDate = analytics.groupEventsByDay.filter(
          x => x._id.event == "game-end"
        );
        this.charts.gamesByDate.labels = finishedRunsByDate.map(x => x._id.day);
        this.charts.gamesByDate.datasets[0].data = finishedRunsByDate.map(
          x => x.frequency
        );

        this.loading = false;
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  }
};
</script>