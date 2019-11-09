<template>
  <div>
    <font-awesome-icon size="lg" class="mr-1" style="color:goldenrod" v-for="_ in current" icon="dice" v-on:click="fireEvent"></font-awesome-icon>
  </div>
</template>

<script>
export default {
  name: "Rerolls",
  props: {
    current: Number,
    allowshake: Boolean
  },
  data() {
      return {

      }
  },
  methods: {
      fireEvent() {
          this.$emit("reroll-consumed")
      }
  }
}
</script>

<style scoped>

</style>