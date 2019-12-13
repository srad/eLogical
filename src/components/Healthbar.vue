<template>
  <div>
    <font-awesome-icon
      :class="{pulsating: current === 1}"
      size="2x"
      class="mr-1 heart"
      v-for="i in current"
      :key="i"
      icon="heart"
      :ref="i"
    ></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Healthbar",
  props: {
    current: Number,
  },
  methods: {
    despawnLife() {
      if (navigator.vibrate) {
        navigator.vibrate(250);
      }
      this.$refs[this.current][0].addEventListener("animationend", () => {
        this.$emit("damage-taken");
      });
      this.$refs[this.current][0].classList.add("despawning");
    },
  },
};
</script>

<style scoped>
.heart {
  color: darkred;
  animation: slideInFromRight 1s;
  animation-delay: 1.5s;
  animation-fill-mode: backwards;
}
.pulsating {
  animation: pulsate 1s;
  animation-iteration-count: infinite;
}
.despawning {
  animation: despawn 1s;
}
@keyframes pulsate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes despawn {
  25% {
    transform: scale(1.5);
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  60% {
    transform: scale(1.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.5);
    opacity: 1;
  }
  80% {
    transform: scale(1.5);
    opacity: 0;
  }
  90% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
@keyframes slideInFromRight {
  from {
    transform: translateX(3em);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>