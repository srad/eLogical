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
import {randomTree} from "@/core/generator";
import vis from "vis-network";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      level: 1,
      max: 5,
      reached: 3,
      selected: [], // Must be an array reference!
      options: [],
    };
  },
  methods: {
    confirm() {
      const params = {};

      this.options.forEach(o => {
        params[0] = false;
      });
      this.selected.forEach(s => {
        params[s] = true;
      });

      alert(this.t.evaluate(params) ? "Correct!" : "Nope");
    },
  },
  mounted() {
    const t = randomTree();
    this.t = t;
    this.options = t.vars.map(v => {
      return { text: v, value: v };
    });
    const obj = t.to("obj");
    const nodes = [];
    const edges = [];
    let id_counter = 0;

    function graph(node, depth = 0, parent = 0) {
      if (depth !== parent) {
        edges.push({ from: parent, to: depth });
      }
      nodes.push({ id: depth, label: node.name || node });

      if (Array.isArray(node.children)) {
        node.children.forEach(n => graph(n, ++id_counter, depth));
      }
    }

    graph(obj);

    const data = {
      nodes: new vis.DataSet(nodes),
      edges: new vis.DataSet(edges),
    };
    const options = {
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
    };
    new vis.Network(this.$refs.tree, data, options);
    katex.render("\\phi =" + t.to("tex"), this.$refs.el);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
