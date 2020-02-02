<template>
  <div class="small" v-if="loaded">
    <line-chart :chart-data="datacollection"></line-chart>
    <button @click="fillData()">Randomize</button>
  </div>
</template>

<script>
import LineChart from "../lib/charts/LineChart.js";

export default {
  name: "RandomChart",
  components: {
    LineChart,
  },
  data () {
    return {
      datacollection: null,
      loaded: false,
    };
  },
  mounted () {
    this.fillData();
  },
  methods: {
    fillData () {
      this.datacollection = {
        labels: [this.getRandomInt(), this.getRandomInt()],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt()],
          }, {
            label: "Data One",
            backgroundColor: "#0066ff",
            data: [this.getRandomInt(), this.getRandomInt()],
          },
        ],
      };
      // only render the graph once we have data (especially important for async calls to api)
      this.loaded = true;
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
  },
};
</script>

<style>
  .small {
    max-width: 600px;
    margin:  150px auto;
  }
</style>