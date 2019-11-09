import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Tree from "./views/Tree";
import Help from "./views/Help";

Vue.use(Router);

export default new Router({
  routes: [
    {path: "/", name: "home", component: Home},
    {path: "/help", name: "help", component: Help},
    {path: "/tree", name: "tree", component: Tree},
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
