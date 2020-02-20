<template>
  <b-row align-v="center" style="height: 100vh" class="home bg-primary text-white">
    <b-col>
      <b-row>
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
        <b-col></b-col>
        <b-col cols="8">
          <router-link to="/game">
            <p class="position-static mb-4 align-bottom text-monospace text-white">
              By using this app you agree and allow us to track your game data anonymously to analyse your learning progress.
              More see <router-link to="imprint" class="text-warning">here</router-link>
            </p>
            <b-button variant="outline-light" size="lg" block>Start Game</b-button>
          </router-link>
        </b-col>
        <b-col></b-col>
      </b-row>
    </b-col>
    <b-modal
      ref="modal"
      title="Welcome!"
      hide-header-close
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
    >
      <b-container>
        <b-row align-h="center">
          <b-container>
            <b-row>
              <b-col
                class="text-center"
              >Welcome to eLogical! To improve your experience we track anonymous data from activities of our users. Are you ok with that?</b-col>
            </b-row>
            <b-row class="mt-4">
              <b-col>
                <b-button variant="success" size="lg" block @click="setTrackingPreferances(true)">Sure</b-button>
              </b-col>
              <b-col>
                <b-button variant="danger" size="lg" block @click="setTrackingPreferances(false)">No</b-button>
              </b-col>
            </b-row>
          </b-container>
        </b-row>
      </b-container>
    </b-modal>
  </b-row>
</template>

<script>
export default {
  name: "Home",
  components: {},
  data(){
    return{
      trackingAsked: false,
    };
  },
  methods: {
    setTrackingPreferances(val){
      localStorage.trackingAllowed = val;
      this.trackingAsked = true;
      this.$refs.modal.hide();
    },
  },
  mounted (){
    if(!localStorage.trackingAllowed && !this.trackingAsked){
      this.$refs.modal.show();
    }
  },
};
</script>

<style scoped>
.home {
  margin-top: -3rem;
}
</style>
