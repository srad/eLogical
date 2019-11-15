require("dotenv").config();

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import BootstrapVue from "bootstrap-vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faHeart, faAward, faStar, faCheck, faRobot, faTimes, faMedal, faLaughBeam, faHeartBroken, faTrophy, faStopwatch, faDice} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {ElogicalApi} from "./services/elogical";

Vue.use(BootstrapVue);

library.add(faHeart, faAward, faStar, faCheck, faRobot, faTimes, faMedal, faLaughBeam, faHeartBroken, faTrophy, faStopwatch, faDice);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.prototype.$log = function (...args) {
  console.log(...args);
};

const api = new ElogicalApi();
Vue.prototype.$api = api;
api.authenticate()
  .then(user => {
    console.log("Authenticated");
  })
  .catch(error => {
    console.log("Token could not be requested:" + error);
  });

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
