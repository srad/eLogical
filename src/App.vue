<template>
  <div id="app">
    <b-navbar toggleable="sm" type="light" variant="primary">
      <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
      <router-link to="/">
        <b-navbar-brand class="font-weight-bold text-white">
          eLogical
          <font-awesome-icon icon="robot" class="ml-3 text-white"/>
        </b-navbar-brand>
      </router-link>

      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item v-for="route in $router.options.routes" :key="route.path">
            <router-link
                :to="route.path"
                class="btn btn-block text-left text-white"
                :active-class="route.name!=='home'?'text-dark':''"
            >{{route.title}}
            </router-link>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container fluid>
      <keep-alive include="Game2">
        <router-view/>
      </keep-alive>
    </b-container>
  </div>
</template>

<style lang="scss">
@import "assets/main.scss";

body {
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>