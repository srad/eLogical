<template>
  <div>
    <font-awesome-icon size="lg" class="mr-1 grow" :style="{color:color}" v-for="_ in current" :icon="icon"></font-awesome-icon>
    <font-awesome-icon size="lg" class="mr-1 grow text-secondary" v-for="_ in max-current" :icon="icon"></font-awesome-icon>
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