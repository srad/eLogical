<template>
  <div id="app">
    <b-navbar toggleable="sm" type="light" variant="light">
      <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>

      <b-navbar-brand class="font-weight-bold">
        eLogical
      </b-navbar-brand>

      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav>
          <!-- put items here -->
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container fluid>
      <router-view/>
    </b-container>
  </div>
</template>

<style>
.container-fluid {
  padding-top: 1rem;
}
</style>
