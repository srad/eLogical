import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import BootstrapVue from "bootstrap-vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faHeart, faAward, faStar, faCheck, faRobot, faTimes, faMedal, faLaughBeam, faHeartBroken, faTrophy, faStopwatch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

Vue.use(BootstrapVue);

library.add(faHeart, faAward, faStar, faCheck, faRobot, faTimes, faMedal, faLaughBeam, faHeartBroken, faTrophy, faStopwatch);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
