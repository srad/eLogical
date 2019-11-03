<template>
  <div>
    <font-awesome-icon size="lg" class="mr-1" style="color:goldenrod" v-for="_ in current" icon="trophy"></font-awesome-icon>
    <font-awesome-icon size="lg" class="mr-1" style="color:darkgrey" v-for="_ in max-current" icon="trophy"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "progresser",
  props: {
    max: Number,
    current: Number,
  },
};
</script>

<style scoped>

</style>