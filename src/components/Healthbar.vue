<template>
  <div>
      <font-awesome-icon :class="{pulsating: current === 1}" size="lg" class="mr-1" style="color:darkred" v-for="_ in current" icon="heart"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Healthbar",
  props: {
    max: Number,
    current: Number,
  }
};
</script>

<style scoped>
.pulsating {
  animation: pulsate 1s;
  animation-iteration-count: infinite;
}
@keyframes pulsate {
  0% {transform: scale(1)}
  50% {transform: scale(1.5)}
  100% {transform: scale(1)}
}

</style>