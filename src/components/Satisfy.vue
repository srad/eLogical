<template>
  <b-container>
    <b-row>
      <b-col>
        <h4><strong>Level {{level}}</strong></h4>
      </b-col>
      <b-col class="text-right">
        <font-awesome-icon size="lg" class="mr-1" style="color:darkred" v-for="_ in reached" icon="heart"></font-awesome-icon>
        <font-awesome-icon size="lg" class="mr-1" style="color:lightgray" v-for="_ in max-reached" icon="heart"></font-awesome-icon>
      </b-col>
    </b-row>
    <hr/>
    <b-row class="text-center">
      <b-col>
        <div ref="el" style="z-index: 1"></div>
      </b-col>
    </b-row>
    <hr/>
    <b-row>
      <b-col>
        <div ref="tree" class="tree"></div>
      </b-col>
    </b-row>
    <b-row class="text-center">
      <b-col>
        <b-form-group label="Set the values">
          <b-form-checkbox-group
              v-model="selected"
              :options="options"
              switches
          ></b-form-checkbox-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row class="text-center">
      <b-col>
          <b-button variant="primary" size="sm" v-on:click="confirm">Confirm</b-button>
      </b-col>
    </b-row>
    


    <b-modal ref="modal" :title="modalText" hide-header-close hide-footer no-close-on-backdrop no-close-on-esc>
    <b-container>
      <b-row align-h="center" block v-if="modalText === 'Game Over!'">
        <b-col cols="6">
          <b-button variant="primary" size="lg" block v-on:click="resetGame">Try Again</b-button>
        </b-col>
      </b-row>
      <b-row align-h="center" v-if="modalText === 'Game Over!'">
        <b-col cols="6">
          <b-button variant="primary" size="lg" block v-on:click="printMessage('functionality not yet implemented')">Leaderboard</b-button>
        </b-col>
      </b-row>
      <b-row align-h="center" v-if="modalText === 'Correct!'">
        <b-col cols="6">
          <b-button variant="primary" size="lg" block v-on:click="loadNextStage">Next Level</b-button>
        </b-col>
      </b-row>
    </b-container>
    </b-modal>
  </b-container>

</template>

<script>
import katex from "katex";
import {randomTree} from "@/lib/compiler/frontend";
import vis from "vis-network";

export default {
  name: "Satisfy",
  props: {},
  data() {
    return {
      level: 1,
      max: 5,
      reached: 3,
      selected: [],
      options: [],
      modalText: '',
      graphConfig: {
        layout: {
          hierarchical: {
            direction: "UD",
            sortMethod: "directed",
          },
        },
        edges: {
          smooth: {
            type: "continuous",
          },
        },
        nodes: {
          physics: false,
        },
      }
    };
  },
  methods: {
    confirm() {
      let params = {};
      this.options.forEach(o => params[o] = false);
      this.selected.forEach(s => params[s] = true);
      if(this.tree.evaluate(params)){
        this.level++
        this.modalText = "Correct!"
        this.$refs['modal'].show()
      }else{
        this.reached--
        if(this.reached === 0){
          this.modalText = 'Game Over!'
          this.$refs['modal'].show()
        }
      }
    },
    resetGame() {
          this.reached = 3
          this.level = 1
          this.generateExercise()
          this.modalText = ''
          this.$refs['modal'].hide()
    },
    loadNextStage() {
          this.generateExercise()
          this.modalText = ''
          this.$refs['modal'].hide()
    },
    generateExercise() {
      let t = randomTree();
      this.tree = t;
      this.options = t.vars.map(v => {
        return {text: v, value: v};
      });
      let obj = t.to("obj");
      let nodes = [];
      let edges = [];
      let id_counter = 0;

      function graph(node, depth = 0, parent = 0) {
        if (depth !== parent) {
          edges.push({from: parent, to: depth});
        }
        nodes.push({id: depth, label: node.name || node});

        if (Array.isArray(node.children)) {
          node.children.forEach(n => graph(n, ++id_counter, depth));
        }
      }

      graph(obj);

      let data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges),
      };
      new vis.Network(this.$refs.tree, data, this.graphConfig);
      katex.render("\\phi =" + t.to("tex"), this.$refs.el);
    },
    printMessage(msg){
      alert(msg)
    }
  },
  mounted() {
    this.generateExercise()
  },
};
</script>

<style>
@import "~katex/dist/katex.min.css";

.katex {
  font-size: 1.8em;
}

.tree {
  height: 30em;
}
</style>
