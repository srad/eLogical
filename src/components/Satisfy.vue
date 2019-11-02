<template>
  <div>
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
    <div ref="el" style="z-index: 1"></div>
    <div ref="tree" class="tree"></div>
    <hr/>
    <b-form-group label="Set the values">
      <b-form-checkbox-group
          v-model="selected"
          :options="options"
          switches
          stacked
      ></b-form-checkbox-group>
    </b-form-group>

    <b-button variant="primary" size="lg" style="bottom: 3%;position: fixed; right: 5%;" v-on:click="confirm">Confirm</b-button>
  </div>

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
          physics: true,
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
        this.generateExercise()
        alert("Correct!")
      }else{
        if(this.reached > 1){
          this.reached--
          alert("nope")
        }else{
          this.reached = 3
          this.level = 1
          this.generateExercise()
          alert("Game Over!")
        }
      }
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
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: 5%;
  top: 25%;
}
</style>
