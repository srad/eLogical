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
            <router-link to="/" class="btn btn-dark btn-block text-left">Home</router-link>
          </b-nav-item>      
          <b-nav-item>
            <router-link to="leaderboard" class="btn btn-dark btn-block text-left">Leaderboard</router-link>
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

<style>
</style>
