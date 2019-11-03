<template>
  <div>
    <b-row>
      <b-col>
        <h4><strong>Level {{level}}</strong></h4>
      </b-col>

      <b-col class="text-right">
        <progresser v-bind:max="progress.max" v-bind:current="progress.current"/>
      </b-col>
    </b-row>

    <hr/>

    <b-row>
      <b-col>
        <tex v-bind:expression="expression"></tex>
      </b-col>
    </b-row>

    <hr/>

    <b-row>
      <b-col>
        <tree v-bind:treeData="treeData" class="tree h-100"></tree>
      </b-col>
    </b-row>

    <b-form-group label="Make the function true" class="user-input">
      <b-form-checkbox-group
          v-model="selected"
          :options="options"
          switches
          stacked
      ></b-form-checkbox-group>
    </b-form-group>

    <b-button-group style="bottom: 3%;position: fixed; right: 5%; z-index: 2">
      <b-button variant="secondary" size="lg" v-on:click="selected=[]">Reset</b-button>
      <b-button variant="primary" size="lg" v-on:click="confirm">Confirm</b-button>
    </b-button-group>

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

export default {
  name: "Satisfy",
  components: {Tree, Tex, Progresser},
  props: {},
  data() {
    return {
      level: 4,
      progress: {
        max: 5,
        current: 4,
      },
      selected: [],
      options: [],
      expression: "",
      treeData: {nodes: [], edges: []},
    };
  },
  computed: {
    selection() {
      let params = {};
      this.options.forEach(o => params[o] = false);
      this.selected.forEach(s => params[s] = true);
      return params;
    },
    vars() {
      return new Array(this.progress.current + 1).fill(0).map((_, index) => "v" + index);
    },
  },
  methods: {
    confirm() {
      const isAnswerCorrect = this.tree.evaluate(this.selection);
      if (isAnswerCorrect) {
        if (this.progress.current === this.progress.max) {
          this.progress.current = 0;
          this.level += 1;
        } else {
          this.progress.current += 1;
        }
        this.$bvModal.show("correct");
      } else {
        this.progress.current = Math.max(this.progress.current - 1, 0);
        if (this.progress.current === 0) {
          this.level = Math.max(this.level - 1, 1);
        }
        this.$bvModal.show("wrong");
      }
    },
    generateExercise() {
      this.selected = [];
      const {tree, solution} = randBoolExpr(2, this.level, this.vars);
      console.log(solution);
      this.tree = tree;
      this.options = this.tree.vars.map(v => {
        return {text: v, value: v};
      });

      const {nodes, edges} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      this.expression = "\\phi =" + this.tree.to("tex");
      const treeNodes = new Set(nodes.filter(node => typeof node.type === "string").map(node => node.label));
      this.options = Array.from(treeNodes).sort();
    },
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style>
.tree {
  min-height: 20em;
}

.user-input {
  z-index: 1;
  left: 5%;
  bottom: 4%;
  position: absolute;
  font-size: 1.2em;
  line-height: 1.2em
}
</style>
