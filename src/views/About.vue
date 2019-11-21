<template>
  <div class="about">
    <h1>About</h1>
    <hr/>
    <p>Mobile elearning PWA to teach solving boolean formulas which are randomly generated and visualized as trees.</p>
    <p>The app was developed by students of the Goethe-University Frankfurt/Main for the course "Platforms and Systems for eLearning" in the winter-semester 2019/20.</p>
    <p>The layout is optimized for mobile devices.</p>
    <!-- <h2>Developers:</h2>
    <p>Our names go here (if we want to)</p>-->
    <hr/>
    <h3>Used frameworks and libs</h3>
      <ol>
        <li v-for="[link, label] in links" :key="link">
          <a :href="link" v-text="label" target="_blank"></a>
        </li>
      </ol>
  </div>
</template>

<script>
export default {
  data() {
    return {
      links: [
        ["https://vuejs.org/", "Vue.js"],
        ["https://bootstrap-vue.js.org/", "BootstrapVue"],
        ["https://vuex.vuejs.org/", "Vuex"],
        ["https://expressjs.com/", "Express"],
        ["https://fontawesome.com/", "Font Awesome"],
        ["https://katex.org/", "Katex"],
        ["https://github.com/visjs/vis-network", "vis-network"],
        ["https://github.com/axios/axios", "axios"],
        ["https://www.chaijs.com/", "Chai"],
      ],
    };
  },
};
</script>