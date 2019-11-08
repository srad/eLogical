<template>
  <div id="app">
    <b-navbar toggleable="sm" type="dark" variant="dark">
      <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>

      <b-navbar-brand class="font-weight-bold">
        eLogical
        <font-awesome-icon icon="robot" class="ml-3 text-white"/>
      </b-navbar-brand>

      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item>
            <router-link to="/" class="btn btn-dark btn-block text-left">Test 1</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="tree" class="btn btn-dark btn-block text-left">Test 2</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="help" class="btn btn-dark btn-block text-left">Help</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="about" class="btn btn-dark btn-block text-left">About</router-link>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container fluid>
      <router-view/>
    </b-container>
  </div>
</template>

<style lang="scss">
@import "assets/main.scss";
</style>
