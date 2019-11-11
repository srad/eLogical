<template>
<div>
  <b-progress :max="100">
    <b-progress-bar :value="(currMs/totalMs)*100" :variant="variant">
      <strong>{{currTime}}</strong>
    </b-progress-bar>
  </b-progress>
</div>
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
      totalMs: null,
      isRunning: false,
      variant: "success"
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
          if ((this.currMs/this.totalMs <= 0.25) || this.currMs < 10000){
            this.variant = "danger"
          }else if ((this.currMs/this.totalMs <= 0.5) || this.currMs < 15000){
            this.variant = "warning"
          }else{
            this.variant = "success"
          }
          if (this.currMs - 500 < 0) {
            this.currMs = 0;
            this.$emit("timer-ended");
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
    this.totalMs = minToMs + secsToMs;
    this.currMs = this.totalMs
    this.isRunning = true;
    this.updateTime();
  }
};
</script>

<style scoped>
</style>