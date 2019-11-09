<template>
  <div>
    <b-row class="pt-3 pb-2 bg-white p-0 mb-3 border-bottom shadow-sm">
      <b-col cols="4">
        <h5><strong>Level {{level.current}}/{{level.max}}</strong></h5>
      </b-col>

      <b-col class="text-center p-0 mr-3 pb-2 pt-0" cols="4">
        <b-progress class="bg-secondary h-100 shadow-sm" :value="progress.current" :max="progress.max">
          <b-progress-bar class="text-dark font-weight-bold" :key="index" v-for="(n, index) in progress.current" :value="1" :label="(index+1)+'/'+progress.max" :style="{backgroundColor: colors[index]}"></b-progress-bar>
        </b-progress>
      </b-col>

      <b-col class="p-0 pt-0 text-right" cols="3">
        <progresser icon="heart" color="darkred" v-bind:max="life.max" v-bind:current="life.current"/>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-card body-class="p-2 pl-3 bg-white" header="Make this formula true" header-bg-variant="dark" header-text-variant="light" header-class="p-2 text-center" class="shadow-sm border-dark">
          <b-card-text class="p-0 m-0">
            <tex v-bind:expression="expression"></tex>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <router-link class="btn btn-warning float-right mt-3 position-absolute" tag="button" style="right: 15px; z-index: 10" to="help">
      <strong>?</strong>
    </router-link>
    <tree v-bind:treeData="treeData" style="height: 45vh"></tree>

    <b-row class="position-absolute w-100 " style="bottom: 17px">
      <b-col cols="9" class="m-0 p-0 pl-3">
        <b-card no-body header-bg-variant="dark" header-text-variant="light" header-class="p-2 text-center shadow-sm">
          <table class="table-dark table-bordered p-0 m-0 table table-sm text-center">
            <thead>
            <td class="text-white bg-dark w-25">Name</td>
            <td class="text-white bg-dark" :key="v" v-for="v in options">
              {{v}}
            </td>
            </thead>
            <tbody>
            <tr>
              <td class="bg-dark text-white">
                Value
              </td>
              <td class="bg-white" :key="v" v-for="v in options">
                <b-form-checkbox v-model="tableSelected" v-bind:value="v" switch/>
              </td>
            </tr>
            </tbody>
          </table>
        </b-card>
      </b-col>
      <b-col cols="2">
        <b-button variant="success" v-on:click="confirm" class="shadow-sm w-100 h-100 overflow-hidden position-absolute">
          <font-awesome-icon icon="check"/>
        </b-button>
      </b-col>
    </b-row>

    <b-modal id="correct" title="Your answer is..." v-on:ok="generateExercise" cancel-disabled>
      <b-row>
        <b-col>
          <h2>
            Correct
            <font-awesome-icon style="color:limegreen" icon="check"></font-awesome-icon>
          </h2>
        </b-col>
        <b-col class="text-right">
          <font-awesome-icon size="3x" style="color:goldenrod" icon="trophy"></font-awesome-icon>
        </b-col>
      </b-row>
    </b-modal>

    <b-modal id="wrong" cancel-disabled title="Your answer is...">
      <b-row>
        <b-col>
          <h2>
            Wrong
          </h2>
        </b-col>
        <b-col class="text-right">
          <font-awesome-icon size="3x" style="color:darkred" icon="heart-broken"></font-awesome-icon>
        </b-col>
      </b-row>
    </b-modal>
  </div>

</template>

<script>
import {randBoolExpr} from "@/lib/compiler/generator";
import Tree from "./Tree";
import Tex from "./Tex";
import Progresser from "./Progresser";
import colors from "@/lib/colors";

export default {
  name: "SatisfyTree",
  components: {Tree, Tex, Progresser},
  props: {},
  data() {
    return {
      colors: colors.gradient.purple,
      level: {
        current: 3,
        max: 4,
      },
      progress: {
        max: 4,
        current: 3,
      },
      life: {
        max: 3,
        current: 3,
      },
      selected: [],
      tableSelected: [],
      options: [],
      texOptions: [],
      expression: "",
      treeData: {nodes: [], edges: []},
      difficultySettings: {
        1: ["and", "or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"],
      },
    };
  },
  computed: {
    max() {
      return this.progress.max;
    },
    selection() {
      let params = {};
      this.options.forEach(o => params[o] = false);
      this.tableSelected.forEach(s => params[s] = true);
      return params;
    },
    vars() {
      return new Array(this.progress.current + 1).fill(0).map((_, index) => "v" + index);
    },
    functions() {
      if (this.level.current <= 3) {
        return this.difficultySettings[this.level.current];
      } else {
        return ["and", "or", "not", "true", "false", "xor", "implication", "eq"];
      }
    },
  },
  methods: {
    confirm() {
      const isAnswerCorrect = this.tree.evaluate(this.selection);
      if (isAnswerCorrect) {
        if (this.progress.current === this.progress.max) {
          this.progress.current = 0;
          this.level.current += 1;
          this.life.current = Math.min(this.life.current + 1, this.life.max);
        } else {
          this.progress.current += 1;
        }
        this.tableSelected = [];
        this.$bvModal.show("correct");
        return;
      }
      // wrong
      this.progress.current = Math.max(this.progress.current - 1, 0);
      if (this.progress.current === 0) {
        if (this.level.current > 1) {
          this.progress.current = this.progress.max - 1;
        }
        this.level.current = Math.max(this.level.current - 1, 1);
      }
      this.life.current = Math.max(this.life.current - 1, 0);
      if (this.life.current < 0) {
        alert("Game Over!");
        return;
      }
      this.$bvModal.show("wrong");
    },
    generateExercise() {
      this.selected = [];
      const {tree, solution} = randBoolExpr({setSize: 2, maxDepth: this.level.current, vars: this.vars, functions: this.functions});
      console.log(solution);
      this.tree = tree;

      const {nodes, edges, leafs} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      this.expression = "\\phi =" + this.tree.to("tex");

      if (leafs.length === 0) {
        // TODO: Only a binary answer needed here. Toggle UI.
      } else {
        const str = leafs.map(node => node.v);
        this.options = Array.from(str).sort();
        this.texOptions = leafs.map(node => node.to("tex")).sort();
      }
    },
  },
  beforeCreate() {
    fetch("https://elogical-api.azurewebsites.net/client")
      .then(req => req.json().then(json => console.log(json)))
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style>
.user-input {
  z-index: 1;
  left: 5%;
  bottom: 4%;
  position: absolute;
  font-size: 1.2em;
  line-height: 1.2em
}
</style>
