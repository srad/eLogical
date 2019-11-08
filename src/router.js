import Vue from "vue";
import Router from "vue-router";
import Game from "./views/Game.vue";
import Game2 from "./views/Game2.vue";
import Home from "./views/Home.vue";
import Leaderboard from "./views/Leaderboard.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {path: "/", name: "home", component: Home},
    {path: "/game", name: "game", component: Game},
    {path: "/game2", name: "game2", component: Game2},
    {path: "/leaderboard", name: "leaderboard", component: Leaderboard},
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ "./views/About.vue"),
    },
  ],
});
