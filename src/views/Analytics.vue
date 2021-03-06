<template>
  <b-container class="text-center">
    <h1>App Dashboard</h1>
    <hr />
    <b-card-group class="mb-4">
      <b-card>
        <h2>Runs started</h2>
        <h3 id="spanRunsStarted"></h3>
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
        <bar-chart
          :chart-data="charts.difficultyComparison.data"
          :options="charts.difficultyComparison.options"
          v-if="!loading"
        ></bar-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
      <b-card>
        <h2>Games played by date</h2>
        <line-chart
          :chart-data="charts.gamesByDate.data"
          :options="charts.gamesByDate.options"
          v-if="!loading"
        ></line-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
    </b-card-group>
    <b-card-group class="mb-4">
      <b-card>
        <h2>Correctness by operator</h2>
        <bar-chart
          :chart-data="charts.mistakesByOperator.data"
          :options="charts.mistakesByOperator.options"
          v-if="!loading"
        ></bar-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
      <b-card>
        <h2>Rewards selected</h2>
        <doughnut-chart
          :chart-data="charts.rewardsSelected.data"
          :options="charts.rewardsSelected.options"
          v-if="!loading"
        ></doughnut-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else />
      </b-card>
    </b-card-group>
  </b-container>
</template>

<script>
import BarChart from "../lib/charts/BarChart";
import DoughnutChart from "../lib/charts/DoughnutChart";
import LineChart from "../lib/charts/LineChart";
export default {
  name: "Profile",
  components: { DoughnutChart, BarChart, LineChart },
  data() {
    return {
      loading: true,
      charts: {
        difficultyComparison: {
          data: {
            labels: [],
            datasets: [
              {
                backgroundColor: "rgb(77, 186, 135)",
                label: "Game Overs",
                data: []
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        },
        gamesByDate: {
          data: {
            labels: [],
            datasets: [
              {
                label: "Number of games played",
                // backgroundColor: "rgb(77, 186, 135)",
                borderColor: "rgb(77, 186, 135)",
                data: []
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        },
        mistakesByOperator: {
          data: {
            labels: ["AND", "OR", "IMPLICATION", "NOT", "XOR", "EQUAL"],
            datasets: [
              {
                label: "answered correctly",
                backgroundColor: "rgb(77, 186, 135)",
                data: [0, 0, 0, 0, 0, 0]
              },
              {
                label: "answered wrong",
                backgroundColor: "rgb(255, 99, 132)",
                data: [0, 0, 0, 0, 0, 0]
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        },
        rewardsSelected: {
          data: {
            labels: ["life", "reroll", "none"],
            datasets: [
              {
                backgroundColor: [
                  "rgb(77, 186, 135)",
                  "rgb(255, 99, 132)",
                  "rgb(60, 60, 60)"
                ],
                data: [0, 0, 0]
              }
            ]
          },
          options: {}
        }
      }
    };
  },
  methods: {
    sortRunsByDate(finishedRunsByDate) {
      finishedRunsByDate.sort(function(a, b) {
        var dateA = a._id.day.toLowerCase(),
          dateB = b._id.day.toLowerCase();
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      });
      return finishedRunsByDate;
    },

    genereateEmptyDayData(unsorted) {
      var sorted = this.sortRunsByDate(unsorted);
      const min = sorted[0]._id.day;
      const max = sorted[sorted.length - 1]._id.day;
      const minDate = new Date(min);
      const maxDate = new Date(max);

      const dateRange = this.getDates(minDate, maxDate);
      const newDates = dateRange.filter(
        e => !sorted.some(x => x._id.day === e)
      );
      newDates.forEach(date => {
        const elem = { _id: { day: date, event: "game-end" }, frequency: 0 };
        sorted.push(elem);
      });
      sorted = this.sortRunsByDate(sorted);
      return sorted;
    },

    getDates(startDate, stopDate) {
      var dateArray = new Array();
      var currentDate = startDate;
      while (currentDate <= stopDate) {
        var newDate = new Date(currentDate);
        dateArray.push(this.formateDate(newDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateArray;
    },

    formateDate(date) {
      var mm = date.getMonth() + 1;
      var dd = date.getDate();
      return [
        date.getFullYear(),
        (mm > 9 ? "" : "0") + mm,
        (dd > 9 ? "" : "0") + dd
      ].join("-");
    }
  },
  mounted() {
    Promise.all([this.$api.getAnalytics()])
      .then(response => {
        const analytics = response[0].data;
        // console.log("analytics", analytics);

        const runsStarted = analytics.groupByEvents[1].frequency;
        const avgRuns = runsStarted / analytics.countUsers;
        const levelsCompleted = analytics.groupBySuccess[1].frequency;

        const rewardsSelected = {};
        analytics.groupByLootSelected.forEach(el => {
          if (el._id.loot === null) {
            rewardsSelected.none = el.frequency;
          } else {
            rewardsSelected[el._id.loot] = el.frequency;
          }
        });
        if (!rewardsSelected.hasOwnProperty("heart")) {
          rewardsSelected.heart = 0;
        }
        if (!rewardsSelected.hasOwnProperty("none")) {
          rewardsSelected.none = 0;
        }
        if (!rewardsSelected.hasOwnProperty("dice")) {
          rewardsSelected.dice = 0;
        }

        // console.log("rewards formatted", rewardsSelected)
        this.charts.rewardsSelected.data.datasets[0].data = [
          rewardsSelected.heart,
          rewardsSelected.dice,
          rewardsSelected.none
        ];

        const deathsByDifficulty = [];
        analytics.groupByGameEndAndDifficulty.forEach(el =>
          deathsByDifficulty.push({
            difficulty: el._id.difficulty,
            frequency: el.frequency
          })
        );
        //sort ascending by difficulty for viz
        deathsByDifficulty.sort(function(a, b) {
          return a.difficulty - b.difficulty;
        });
        // console.log("deaths sorted", deathsByDifficulty)
        let difficultyComparisonData = [];
        deathsByDifficulty.forEach(el => {
          this.charts.difficultyComparison.data.labels.push(el.difficulty);
          difficultyComparisonData.push(el.frequency);
        });
        // console.log("deathsByDifficulty formatted", difficultyComparisonData)
        this.charts.difficultyComparison.data.datasets[0].data = difficultyComparisonData;

        let mistakeCount = {
            and: 0,
            or: 0,
            not: 0,
            xor: 0,
            implication: 0,
            eq: 0
          },
          correctCount = {
            and: 0,
            or: 0,
            not: 0,
            xor: 0,
            implication: 0,
            eq: 0
          };

        let correctByOperator = analytics.groupBySuccessAndOperator.filter(
          el => el._id.success === true
        );
        // console.log("correctByOperator", correctByOperator)
        correctByOperator.forEach(el =>
          el._id.op.forEach(
            op => (correctCount[op] = correctCount[op] + el.frequency)
          )
        );
        // console.log("correctCount", correctCount)
        this.charts.mistakesByOperator.data.datasets[0].data = [
          correctCount.and,
          correctCount.or,
          correctCount.implication,
          correctCount.not,
          correctCount.xor,
          correctCount.eq
        ];

        let mistakesByOperator = analytics.groupBySuccessAndOperator.filter(
          el => el._id.success === false
        );
        // console.log("mistakesByOperator", mistakesByOperator)
        mistakesByOperator.forEach(el =>
          el._id.op.forEach(
            op => (mistakeCount[op] = mistakeCount[op] + el.frequency)
          )
        );
        // console.log("mistakeCount", mistakeCount)
        this.charts.mistakesByOperator.data.datasets[1].data = [
          mistakeCount.and,
          mistakeCount.or,
          mistakeCount.implication,
          mistakeCount.not,
          mistakeCount.xor,
          mistakeCount.eq
        ];

        document.getElementById("spanRunsStarted").innerText = runsStarted;
        document.getElementById("spanAvgRuns").innerText = avgRuns.toFixed(2);
        document.getElementById(
          "spanLevelsCompleted"
        ).innerText = levelsCompleted;

        var finishedRunsByDate = analytics.groupEventsByDay.filter(
          x => x._id.event == "game-end"
        );

        finishedRunsByDate = this.genereateEmptyDayData(finishedRunsByDate);

        this.charts.gamesByDate.data.labels = finishedRunsByDate.map(
          x => x._id.day
        );
        this.charts.gamesByDate.data.datasets[0].data = finishedRunsByDate.map(
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