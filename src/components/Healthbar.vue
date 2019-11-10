<template>
  <div>
      <font-awesome-icon :class="{pulsating: current === 1}" size="lg" class="mr-1" style="color:darkred" v-for="i in current" :key="i" icon="heart" :ref="i"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Healthbar",
  props: {
    current: Number
  },
  methods: {
    despawnLife() {
      this.$refs[this.current][0].classList.add("despawning")
    }
  }
};
</script>

<style scoped>
.pulsating {
  animation: pulsate 1s;
  animation-iteration-count: infinite;
}
.despawning {
  animation: despawn 1s;
}
@keyframes pulsate {
  0% {transform: scale(1)}
  50% {transform: scale(1.5)}
  100% {transform: scale(1)}
}
@keyframes despawn {
  0% {transform: scale(1)}
  25% {transform: scale(0.5)}
  50% {transform: scale(2)}
  75% {transform: scale(2); opacity: 1}
  100% {transform: translateY(-1em); opacity: 0}
}
</style>