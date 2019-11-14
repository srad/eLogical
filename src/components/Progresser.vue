<template>
  <div>
    <font-awesome-icon size="lg" class="mr-1 grow" :style="{color:color}" v-for="_ in _current" :icon="icon"></font-awesome-icon>
    <font-awesome-icon size="lg" class="mr-1 grow text-secondary" v-for="_ in max-_current" :icon="icon"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "progresser",
  props: {
    max: Number,
    current: Number,
    icon: String,
    color: String,
  },
  computed: {
    _current() {
      return Math.max(this.current, 0);
    },
  },
};
</script>

<style scoped>
.grow {
  transition: all .2s ease-in-out;
}

.grow:hover {
  transition: all .2s ease-in-out;
  transform: scale(1.5);
}
</style>