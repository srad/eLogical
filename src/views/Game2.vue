<template>
  <div>
    <b-row class="pt-3 pb-2 bg-white p-0 mb-3 border-bottom shadow-sm">
      <b-col cols="4">
        <h5><strong>Level {{level.current}}/{{level.max}}</strong></h5>
      </b-col>

      <b-col class="text-center p-0 mr-3 pb-2 pt-0" cols="4">
        <b-progress class="bg-secondary h-100 shadow-sm" :value="progress.current" :max="progress.max">
          <b-progress-bar class="font-weight-bold" :key="index" v-for="(n, index) in progress.current" :value="1" :label="(index+1)+'/'+progress.max" :style="{backgroundColor: colors[index]}"></b-progress-bar>
        </b-progress>
      </b-col>

      <b-col class="p-0 pt-0 text-right" cols="3">
        <progresser icon="heart" color="darkred" v-bind:max="life.max" v-bind:current="life.current"/>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-card body-class="p-1" bg-variant="white" :header="cardHeader" header-bg-variant="primary" header-text-variant="white" header-class="p-1 text-center" class="shadow-sm border-dark">
          <b-card-text class="p-0 m-0 text-center">
            <tex v-bind:expression="expression"></tex>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <div style="right: 15px; z-index: 10" class="float-right mt-3 position-absolute">
      <router-link class="btn btn-warning toolbar" tag="button" to="help">
        <strong>?</strong>
      </router-link>
      <br/>
      <b-button variant="danger" class="toolbar" v-on:click="dice">
        <strong>
          <font-awesome-icon icon="dice"/>
        </strong>
      </b-button>
    </div>

    <tree v-bind:treeData="treeData" class="mt-2" v-on:click-node="clickNode" style="height: 45vh"></tree>

    <b-row class="position-absolute w-100 " style="bottom: 17px">
      <b-col cols="9" class="m-0 p-0 pl-3">
        <b-card no-body header-bg-variant="primary" header-text-variant="light" header-class="p-2 text-center shadow-sm">
          <table class="table-dark table-bordered border-light m-0 table table-sm shadow-sm text-center">
            <thead>
            <th :key="v.name" v-for="v in options" class="p-0">
              {{v.name}}
            </th>
            </thead>
            <tbody>
            <tr>
              <td class="bg-white p-0" :key="v.name" v-for="v in options">
                <b-form-checkbox v-model="selected" v-bind:value="v.name" switch/>
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

    <b-modal id="message" :header-bg-variant="message.variant"
             :ok-only="!message.cancel"
             :ok-variant="message.variant"
             :title="message.title"
             v-on="{ok: (message.ok ? message.ok: null)}">
      <b-row>
        <b-col>
          <h4>{{message.text}}</h4>
        </b-col>
        <b-col class="text-right" v-if="message.icon">
          <font-awesome-icon size="4x" :icon="message.icon" :class="'text-'+message.variant"></font-awesome-icon>
        </b-col>
      </b-row>
    </b-modal>
  </div>

</template>

<script>
import {randBoolExpr} from "@/lib/compiler/generator";
import Tree from "../components/Tree";
import Tex from "../components/Tex";
import Progresser from "../components/Progresser";
import colors from "@/lib/colors";
import {ConstNode} from "../lib/compiler/tree";

export default {
  name: "Game2",
  components: {Tree, Tex, Progresser},
  props: {},
  data() {
    return {
      message: {
        text: "",
        title: "",
        variant: "primary",
        ok: () => {
        },
      },
      tree: undefined,
      nodeId: 0,
      expression: "",
      header: "",
      colors: colors.gradient.purple,
      level: {
        current: 1,
        max: 4,
      },
      progress: {
        max: 4,
        current: 1,
      },
      life: {
        max: 3,
        current: 1,
      },
      selected: [],
      options: [],
      texOptions: [],
      treeData: {nodes: [], edges: []},
      difficultySettings: {
        1: ["and", "or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"],
      },
    };
  },
  watch: {
    tree(node) {
      if (node instanceof ConstNode) {
        const idx = this.selected.indexOf(node.v);
        if (idx !== -1) {
          this.selected.splice(idx, 1);
        } else {
          this.selected.push(node.v);
        }
      }
      this.expression = (this.nodeId === 0 ? "\\phi = " : "") + node.to("tex", {color: true});
    },
    message() {
      this.$bvModal.show("message");
    },
  },
  computed: {
    cardHeader() {
      if (this.nodeId === 0) {
        return "Make this formula true";
      }
      return "Part of the expression";
    },
    hasWon() {
      return this.level.current === this.level.max && this.progress.current === this.progress.max;
    },
    isSectionComplete() {
      return this.progress.current === this.progress.max;
    },
    selection() {
      let params = {};
      this.selected.forEach(s => params[s] = true);
      return params;
    },
    vars() {
      return new Array(this.progress.current + 1).fill(0).map((_, index) => "v" + index);
    },
    expFilter() {
      if (this.level.current <= 3) {
        return this.difficultySettings[this.level.current];
      }
      return undefined;
    },
  },
  methods: {
    restart() {
      this.level.current = 1;
      this.progress.current = 1;
      this.life.current = this.life.max;
      this.generateExercise();
    },
    clickNode({node, id}) {
      this.nodeId = id;
      this.tree = node;
    },
    dice() {
      if (this.life.current > 0) {
        this.message = {
          title: "Retry",
          variant: "primary",
          text: "It costs you 1 life to generate another formula!",
          ok: () => {
            this.life.current -= 1;
            this.generateExercise();
          },
        };
      } else {
        this.message = {
          title: "Info",
          text: "You have no more lifes to spare for a retry!",
          variant: "danger",
          ok: () => {
          },
        };
      }
    },
    confirm() {
      const isAnswerCorrect = this.tree.evaluate(this.selection);

      if (isAnswerCorrect) {
        this.$api.saveAnswer({
          level: this.level,
          progress: this.progress,
          score: 1
        });
        this.message = {
          title: "Your answer is ...",
          text: "Correct!",
          icon: "check",
          variant: "primary",
          ok: () => {
            if (this.isSectionComplete) {
              if (this.hasWon) {
                this.message = {
                  title: "Congratulations!",
                  text: "You have won! Press ok to restart the game!",
                  icon: "trophy",
                  variant: "warning",
                  ok: this.restart,
                };
                return;
              } else {
                this.progress.current = 1;
                this.level.current += 1;
                this.life.current = Math.min(this.life.current + 1, this.life.max);
              }
            } else {
              this.progress.current += 1;
            }

            this.generateExercise();
          },
        };
        return;
      }
      // wrong
      this.progress.current = Math.max(this.progress.current - 1, 1);
      if (this.progress.current === 0) {
        if (this.level.current > 1) {
          this.progress.current = this.progress.max;
        }
        this.level.current = Math.max(this.level.current - 1, 1);
      }
      this.life.current -= 1;
      if (this.life.current < 0) {
        this.message = {
          title: "Game Over",
          text: "You lost!",
          icon: "heart-broken",
          variant: "danger",
          ok: this.restart,
        };
      } else {
        this.message = {
          title: "Your answer is..",
          text: "Wrong!",
          icon: "heart-broken",
          variant: "danger",
          ok() {

          },
        };
      }
    },
    generateExercise() {
      // Reset
      this.nodeId = 0;
      this.selected = [];
      // Generate tree
      const {tree} = randBoolExpr({setSize: 2, maxDepth: this.level.current, vars: this.vars, expWhiteList: this.expFilter});
      this.tree = tree;
      // Draw tree
      const {nodes, edges, leafs} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      // TODO: Show only yes/no answer
      this.singleChoice = leafs.length === 0;
      if (!this.singleChoice) {
        this.options = leafs.map(node => ({name: node.v, color: node.color})).sort((a, b) => a.name.localeCompare(b.name));
        this.texOptions = leafs.map(node => node.to("tex")).sort();
      }
    },
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style scoped>
.toolbar {
  width: 2.7em;
  margin-bottom: 0.1em;
}
</style>
