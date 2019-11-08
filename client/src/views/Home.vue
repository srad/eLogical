<template>
  <div class="home">
    <b-row class="mt-5">
      <b-col class="text-center">
        <h1>Welcome to</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-center">
        <font-awesome-icon icon="robot" size="5x" class="mt-3 mb-3"/>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="text-center">
        <h1>eLogical</h1>
      </b-col>
    </b-row>
    <b-row class="mt-5">
      <b-col>
        <router-link to="/game">
          <b-button variant="primary" size="lg" block >Start Game</b-button>
        </router-link>
      </b-col>
        <b-col>
        <router-link to="/game2">
          <b-button variant="primary" size="lg" block >Start Game2</b-button>
        </router-link>
      </b-col>
    </b-row>
  </div>
</template>


<script>
export default {
  name: "home",
  components: {
  },
};
</script>

<style>
</style>
