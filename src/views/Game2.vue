<template>
  <div style="margin-top: -0.5rem">
    <b-row class="border-bottom shadow-sm pt-2 mb-3" style="padding-top: 0.7rem !important;">
      <b-col cols="5">
        <h4 class="pb-1">
          <strong>Level {{levelCurrent}}/{{levelMax}}</strong>
        </h4>
      </b-col>

      <b-col aria-colcount="7" class="pl-0 ml-0">
        <b-progress
          class="bg-secondary h-75 shadow-sm"
          :current="progressCurrent"
          :max="progressMax"
        >
          <block-bar :colors="colors" :current="progressCurrent" :max="progressMax" />
        </b-progress>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col cols="6" class="text-left">
        <ressource
          animate
          hide-animation-class="swing"
          icon="dice"
          v-on:click="dice"
          color
          class="text-warning"
          v-bind:max="retryMax"
          v-bind:current="retryCurrent"
        />
      </b-col>
      <b-col cols="6" class="text-right">
        <ressource
          animate
          hide-animation-class="hinge"
          icon="heart"
          color
          class="text-danger"
          v-bind:max="lifeMax"
          v-bind:current="lifeCurrent"
        />
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-card
          v-bind:class="{'animated slow shake': success===false, 'animated tada': success===true}"
          body-class="p-1"
          bg-variant="white"
          :header="cardHeader"
          :header-bg-variant="success===false?'danger':'primary'"
          header-class="p-1 text-center text-white"
          class="shadow-sm border-dark"
        >
          <b-card-text class="p-0 m-0 text-center">
            <tex v-bind:expression="expression"></tex>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <tree v-bind:treeData="treeData" class="mt-2" style="height: 40vh"></tree>

    <b-row class="position-absolute w-100" style="bottom: 3%">
      <b-col class="text-left" cols="3">
        <b-button variant="primary" size="lg" v-on:click="confirm">ok</b-button>
      </b-col>
      <b-col class="text-right">
        <b-button
          ref="btnSelect"
          v-for="(node, index) in options"
          :key="node.name"
          v-bind:class="{'ml-1': index > 0}"
          :variant="node.selected ? 'primary animated flip' : 'danger animated pulse'"
          @click="select(node.name, index)"
          size="lg"
          class="p-2 pl-3 pr-3 faster"
        >{{node.name}}</b-button>
      </b-col>
    </b-row>

    <b-modal
      id="message"
      :header-bg-variant="message.variant"
      :ok-only="!message.cancel"
      :ok-variant="message.variant"
      :title="message.title"
      v-on="{ok: (message.ok ? message.ok: null)}"
    >
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
import Ressource from "../components/Ressource";
import colors from "@/lib/colors";
import {ConstNode} from "../lib/compiler/tree";
import BlockBar from "../components/BlockBar";

export default {
  name: "Game2",
  components: {Tree, Tex, Ressource, BlockBar},
  props: {},
  data() {
    return {
      message: {
        text: "",
        title: "",
        variant: "primary",
        ok: () => {},
      },
      tree: undefined,
      nodeId: 0,
      expression: "",
      header: "",
      colors: colors.gradient.purple,
      success: undefined,
      levelCurrent: 1,
      levelMax: 4,
      progressCurrent: 1,
      progressMax: 4,
      lifeCurrent: 4,
      lifeMax: 4,
      retryCurrent: 3,
      retryMax: 3,
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
        this.select(node.v);
      }
      this.expression =
        (this.nodeId === 0 ? "\\phi = " : "") + node.to("tex", {color: true});
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
      return (
        this.levelCurrent === this.levelMax &&
        this.progressCurrent === this.progressMax
      );
    },
    isSectionComplete() {
      return this.progressCurrent === this.progressMax;
    },
    vars() {
      return new Array(this.progressCurrent + 1)
        .fill(0)
        .map((_, index) => `v${index}`);
    },
    expFilter() {
      if (this.levelCurrent <= 3) {
        return this.difficultySettings[this.levelCurrent];
      }
      return undefined;
    },
  },
  methods: {
    select(node, index) {
      this.options[index].selected = !this.options[index].selected;
    },
    restart() {
      this.levelCurrent = 1;
      this.progressCurrent = 1;
      this.lifeCurrent = this.lifeMax;
      this.retryCurrent = this.retryMax;
      this.generateExercise();
    },
    dice() {
      this.retryCurrent = Math.max(this.retryCurrent - 1, 0);
      this.generateExercise();
    },
    confirm() {
      const selection = {};
      this.options.forEach(o => (selection[o.name] = o.selected));
      const isAnswerCorrect = this.tree.evaluate(selection);
      this.success = isAnswerCorrect;
      setTimeout(() => (this.success = undefined), 1500);

      if (isAnswerCorrect) {
        this.$api.saveAnswer({
          level: this.level,
          progress: this.progress,
          score: 1,
        });
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
            this.progressCurrent = 1;
            this.levelCurrent += 1;
            this.lifeCurrent = Math.min(this.lifeCurrent + 1, this.lifeMax);
            this.retryCurrent = Math.min(this.retryCurrent + 1, this.retryMax);
          }
        } else {
          this.progressCurrent += 1;
        }

        setTimeout(this.generateExercise, 1500);
        return;
      }
      // wrong
      this.progressCurrent = Math.max(this.progressCurrent - 1, 1);
      if (this.progressCurrent === 0) {
        if (this.levelCurrent > 1) {
          this.progressCurrent = this.progressMax;
        }
        this.levelCurrent = Math.max(this.levelCurrent - 1, 1);
      }
      this.lifeCurrent -= 1;
      if (this.lifeCurrent < 0) {
        this.message = {
          title: "Game Over",
          text: "You lost!",
          icon: "heart-broken",
          variant: "danger",
          ok: this.restart,
        };
      }
    },
    generateExercise() {
      this.nodeId = 0; // Reset any tree click
      // Generate tree
      const {tree} = randBoolExpr({
        setSize: 2,
        maxDepth: this.levelCurrent,
        vars: this.vars,
        expWhiteList: this.expFilter,
      });
      this.tree = tree;
      // Draw tree
      const {nodes, edges, leafs} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      // TODO: Show only yes/no answer
      this.singleChoice = leafs.length === 0;
      if (!this.singleChoice) {
        this.options = leafs
          .map(node => ({name: node.v, color: node.color, selected: false}))
          .sort((a, b) => a.name.localeCompare(b.name));
        this.texOptions = leafs.map(node => node.to("tex")).sort();
      }
    },
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style>
@import "~animate.css/animate.min.css";
</style>