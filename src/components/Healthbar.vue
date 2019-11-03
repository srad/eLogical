<template>
  <div>
    <font-awesome-icon size="lg" class="mr-1" style="color:darkred" v-for="_ in current" icon="heart"></font-awesome-icon>
    <font-awesome-icon size="lg" class="mr-1" style="color:darkgrey" v-for="_ in max-current" icon="heart"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Healthbar",
  props: {
    max: Number,
    current: Number,
  },
};
</script>

<style scoped>

</style>