<template>
  <b-container>
    <b-row v-if="showIcon">
      <b-col class="text-center">
        <font-awesome-icon size="5x" class="mr-1" style="color:darkgrey" icon="stopwatch"></font-awesome-icon>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-center">
        <strong>{{currTime}}</strong>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "Stopwatch",
  props: {
    time: String,
    countingDown: Boolean,
    showIcon: Boolean
  },
  data() {
    return {
      currMs: null,
      isRunning: false
    };
  },
  computed: {
    currTime() {
      let currMins = Math.floor(this.currMs / 60000);
      let currSec = Math.floor((this.currMs - currMins * 60000) / 1000);
      return currMins + ":" + currSec;
    }
  },
  methods: {
    updateTime() {
      if (this.isRunning) {
        if (this.countingDown) {
          if (this.currMs - 500 < 0) {
            this.currMs = 0;
            this.$emit("timer-stopped");
          } else {
            this.currMs -= 500;
            setTimeout(this.updateTime, 500);
          }
        } else {
          this.currMs += 500;
          setTimeout(this.updateTime, 500);
        }
      }
    },
    startTimer() {
      let minToMs = Number(this.time.split(":")[0]) * 60000,
        secsToMs = Number(this.time.split(":")[1]) * 1000;
      this.currMs = minToMs + secsToMs;
      this.isRunning = true;
      this.updateTime();
    },
    stopTimer() {
      this.isRunning = false;
      this.$emit("timer-stopped", this.time);
    }
  },
  mounted() {
    let minToMs = Number(this.time.split(":")[0]) * 60000,
      secsToMs = Number(this.time.split(":")[1]) * 1000;
    this.currMs = minToMs + secsToMs;
    this.isRunning = true;
    this.updateTime();
  }
};
</script>

<style scoped>
</style>