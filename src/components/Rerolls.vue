<template>
  <div>
    <font-awesome-icon :ref="i" size="2x" class="mr-1 dice" v-for="i in current" :key="i" icon="dice" v-on:click="fireEvent(i)"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Rerolls",
  props: {
    current: Number
  },
  data() {
      return {

      }
  },
  methods: {
      fireEvent(i) {
        this.$refs[this.current][0].addEventListener("animationend",() => {
          this.$emit("reroll-consumed")
        })
        this.$refs[this.current][0].classList.add("despawning")
        this.$emit("rerolling")
      }
  }
}
</script>

<style scoped>
.dice {
  color: goldenrod;
  animation: slideInFromRight 1s;
  animation-delay: 1.5s;
  animation-fill-mode: backwards;
}
.despawning {
  animation-name: despawn;
  animation-duration: 1s;
  animation-fill-mode: forwards;
}
@keyframes despawn {
  0% {transform: scale(1)}
  50% {transform: scale(1.5)}
  75% {transform: scale(1.5); opacity: 1}
  100% {transform: scale(1) translateY(1em); opacity: 0}
}
@keyframes slideInFromRight{
  from{
    transform: translateX(3em);
    opacity: 0;
  }
  to{
    transform: translateX(0);
    opacity: 1;
  }
}
</style>