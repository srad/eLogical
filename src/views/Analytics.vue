<template>
  <b-container class="text-center">
    <h1>App Dashboard</h1>
    <hr />
    <b-card-group class="mb-4">
      <b-card>
        <h2>Runs completed</h2>
        <h3 id="spanRunsCompleted"></h3>
        <b-spinner
          style="width: 3rem; height: 3rem;"
          variant="primary"
          label="Loading"
          v-if="loading"
        />
      </b-card>
      <b-card>
        <h2>Avg. runs per user</h2>
        <h3 id="spanAvgRuns"></h3>
        <b-spinner
          style="width: 3rem; height: 3rem;"
          variant="primary"
          label="Loading"
          v-if="loading"
        />
      </b-card>
      <b-card>
        <h2>Levels completed</h2>
        <h3 id="spanLevelsCompleted"></h3>
        <b-spinner
          style="width: 3rem; height: 3rem;"
          variant="primary"
          label="Loading"
          v-if="loading"
        />
      </b-card>
    </b-card-group>
    <b-card-group class="mb-4">
      <b-card>
        <h2>Game Over by difficulty</h2>
        <bar-chart :chart-data="charts.difficultyComparison" v-if="!loading"></bar-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
      <b-card>
        <h2>Games played by date</h2>
        <bar-chart :chart-data="charts.gamesByDate" v-if="!loading"></bar-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
    </b-card-group>
    <b-card-group class="mb-4">
      <b-card>
        <h2>Mistakes by operator</h2>
        <doughnut-chart :chart-data="charts.mistakesByOperator" v-if="!loading"></doughnut-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
      <b-card>
        <h2>Rewards selected</h2>
        <doughnut-chart :chart-data="charts.rewardsSelected" v-if="!loading"></doughnut-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
    </b-card-group>
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
              backgroundColor: ["rgb(77, 186, 135)", "rgb(255, 99, 132)"],
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

        finishedRunsByDate.sort(function(a, b) {
          var dateA = a._id.day.toLowerCase(),
            dateB = b._id.day.toLowerCase();
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;
          return 0;
        });

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