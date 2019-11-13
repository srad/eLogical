import Vue from "vue";
import Router from "vue-router";
import Game from "./views/Game.vue";
import Game2 from "./views/Game2.vue";
import Home from "./views/Home.vue";
import Help from "./views/Help";
import Leaderboard from "./views/Leaderboard.vue";
import About from "./views/About.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {path: "/", name: "home", component: Home, title: "Home"},
    {path: "/game", name: "game", component: Game, title: "Game 1"},
    {path: "/game2", name: "game2", component: Game2, title: "Game 2"},
    {path: "/leaderboard", name: "leaderboard", component: Leaderboard, title: "Leaderboard"},
    {path: "/help", name: "help", component: Help, title: "Help"},
    {path: "/about", name: "about", component: About, title: "About"},
  ],
});
