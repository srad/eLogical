<template>
  <div class="pt-4 pr-3 pl-3">
    <h1 ref="difficultyTitle" class="title-difficulty">Chapter {{progress.difficulty}}</h1>
    <h1 ref="levelTitle" class="title-level">Level {{progress.currLevel}}</h1>
    <b-row>
      <b-col cols="3">
        <h4>Stage {{progress.difficulty}} - {{progress.currLevel}}</h4>
      </b-col>

      <b-col>
        <b-container>
          <b-row>
            <b-col class="text-right">
              <healthbar ref="healthbar" v-bind:current="health" />
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              <rerolls :current="rerolls" v-on:reroll-consumed="rerollExpression" />
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>

    <hr />
    <b-row>
      <b-col class="text-center">
        <tex v-bind:expression="expression" ref="tex"></tex>
      </b-col>
    </b-row>
    <hr />
      <stopwatch
      v-if="progress.currLevel === progress.maxLevel"
          ref="stopwatch"
          :time="stopwatchTime"
          :countingDown="true"
          :showIcon="false"
          v-on:timer-stopped="gameOver"
      ></stopwatch>

    <tree v-bind:treeData="treeData" class="tree"></tree>
    <b-row align-h="center">
      <b-col cols="6" sm="4" lg="2" :key="v" v-for="v in options" class="text-center">
        <button v-on:click="toggleVariable(v)" class="selector false" :ref="v">{{v}}</button>
      </b-col>
    </b-row>

    <b-row class="text-center" style="margin-top: 2em;">
      <b-col>
        <b-button variant="primary" size="lg" v-on:click="confirm">Confirm</b-button>
      </b-col>
    </b-row>

    <b-modal
      ref="modal"
      :title="modalText"
      hide-header-close
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
    >
      <b-container>
        <b-row align-h="center" block v-if="modalText === 'Game Over!'" class="mb-3">
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="resetGame">Try Again</b-button>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Game Over!'">
          <b-col cols="6">
            <!-- <b-button variant="primary" size="lg" block v-on:click="printMessage('functionality not yet implemented')">Leaderboard</b-button> -->
            <router-link to="/leaderboard">
              <b-button variant="primary" size="lg" block>Leaderboard</b-button>
            </router-link>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Correct!'">
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="loadNextStage">Next Level</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import { randBoolExpr } from "@/lib/compiler/generator";
import Tree from "../components/Tree";
import Tex from "../components/Tex";
import Healthbar from "../components/Healthbar";
import Stopwatch from "../components/Stopwatch";
import Rerolls from "../components/Rerolls";

export default {
  name: "Game",
  components: { Tree, Tex, Healthbar, Stopwatch, Rerolls },
  props: {},
  data() {
    return {
      progress: {
        difficulty: 1,
        currLevel: 1,
        maxLevel: 5
      },
      health: 3,
      rerolls: 3,
      selected: [],
      options: [],
      expression: "",
      modalText: "",
      treeData: { nodes: [], edges: [] },
      difficultySettings: {
        1: ["and", "or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"]
      }
    };
  },
  computed: {
    selection() {
      let params = {};
      this.options.forEach(o => (params[o] = false));
      this.selected.forEach(s => (params[s] = true));
      return params;
    },
    vars() {
      return new Array(this.progress.currLevel + 1)
        .fill(0)
        .map((_, index) => "v" + index);
    },
    functions() {
      if (this.progress.difficulty <= 3) {
        return this.difficultySettings[this.progress.difficulty];
      } else {
        return [
          "and",
          "or",
          "not",
          "true",
          "false",
          "xor",
          "implication",
          "eq"
        ];
      }
    },
    stopwatchTime() {
      let minutesPerDifficulty = 0.5,
        totalSecs = minutesPerDifficulty * 60 * this.progress.difficulty,
        mins = Math.floor(totalSecs / 60),
        secs = totalSecs - mins * 60;
      return mins + ":" + secs;
    }
  },
  methods: {
    toggleVariable(value) {
      let pos = this.selected.indexOf(value);
      this.$refs[value][0].classList.add("toggle-selector");
      if (pos > -1) {
        this.selected.splice(pos, 1);
        setTimeout(() => {
          this.$refs[value][0].classList.remove("true");
          this.$refs[value][0].classList.add("false");
          this.$refs[value][0].classList.remove("toggle-selector");
        }, 500);
      } else {
        this.selected.push(value);
        setTimeout(() => {
          this.$refs[value][0].classList.remove("false");
          this.$refs[value][0].classList.add("true");
          this.$refs[value][0].classList.remove("toggle-selector");
        }, 500);
      }
    },
    rerollExpression() {
      this.$refs["tex"].$el.classList.add("text-reroll");
      setTimeout(() => {
        this.generateExercise();
      }, 500);
      setTimeout(() => {
        this.rerolls--;
        this.$refs["tex"].$el.classList.remove("text-reroll");
      }, 1000);
    },
    confirm() {
      const isAnswerCorrect = this.tree.evaluate(this.selection);
      if (isAnswerCorrect) {
        if (this.progress.currLevel === this.progress.maxLevel) {
          this.progress.currLevel = 1;
          this.progress.difficulty++;
        } else {
          this.progress.currLevel++;
        }
        this.options.forEach(opt => {
          this.$refs[opt][0].classList.remove("true");
          this.$refs[opt][0].classList.remove("false");
          this.$refs[opt][0].classList.add("false");
        });
        this.generateExercise();
      } else {
        if (navigator.vibrate) {
          navigator.vibrate(250);
        }
        this.$refs["healthbar"].despawnLife();
        setTimeout(() => {
          this.health--;
          if (this.health === 0) {
            this.gameOver();
          }
        }, 1000);
      }
    },
    generateExercise() {
      this.selected = [];
      const { tree, solution } = randBoolExpr({
        setSize: 2,
        maxDepth: this.progress.difficulty,
        vars: this.vars,
        functions: this.functions
      });
      console.log(solution);
      this.tree = tree;
      this.options = this.tree.vars.map(v => {
        return { text: v, value: v };
      });

      const { nodes, edges, leafs } = this.tree.toGraph();
      this.treeData = { nodes, edges };
      this.expression = "\\phi =" + this.tree.to("tex");
      if (leafs.length === 0) {
        // TODO: Only a binary answer needed here. Toggle UI.
      } else {
        const str = leafs.map(node => node.v);
        this.options = Array.from(str).sort();
        this.texOptions = leafs.map(node => node.to("tex")).sort();
      }
      this.$refs["difficultyTitle"].classList.add("scroll-to-right");
      this.$refs["levelTitle"].classList.add("scroll-to-left");
      setTimeout(() => {
        this.$refs["difficultyTitle"].classList.remove("scroll-to-right");
        this.$refs["levelTitle"].classList.remove("scroll-to-left");
      }, 2000);
    },
    resetGame() {
      this.generateExercise();
      this.modalText = "";
      this.$refs["modal"].hide();
      this.progress.currLevel = 1;
      this.progress.difficulty = 1;
      this.health = 3;
    },
    gameOver() {
      this.modalText = "Game Over!";
      this.$refs["modal"].show();
    },
    printMessage(msg) {
      alert(msg);
    }
  },
  mounted() {
    this.generateExercise();
  }
};
</script>

<style>
.tree {
  height: 35vh;
}
.selector {
  width: 15vh;
  height: 15vh;
  color: white;
  border-radius: 2px;
  border-color: transparent;
  margin-bottom: 1em;
}
.toggle-selector {
  animation: spin 0.5s;
}
.true {
  background-color: #28a745;
  box-shadow: 0 0 5px #05ec3b;
}
.true:hover {
  background-color: #1e7e34;
  color: white;
}
.false {
  background-color: #dc3545;
  box-shadow: 0 0 5px #f1031b;
}
.false:hover {
  background-color: #c82333;
  color: white;
}
.text-reroll {
  animation: textReroll 1s;
  animation-iteration-count: 1;
}
.title-level {
  z-index: 999;
  font-size: 4em;
  position: fixed;
  top: 50vh;
  right: -5em;
}
.title-difficulty {
  z-index: 999;
  font-size: 4em;
  position: fixed;
  top: 30vh;
  left: -5em;
}
.scroll-to-left {
  animation-name: scrollToLeft;
  animation-duration: 1.5s;
  animation-timing-function: cubic-bezier(0.11, 1.23, 0.98, 0.01);
}
.scroll-to-right {
  animation-name: scrollToRight;
  animation-duration: 1.5s;
  animation-timing-function: cubic-bezier(0.11, 1.23, 0.98, 0.01);
}
@keyframes textReroll {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
    color: transparent;
    text-shadow: 0 0 0px rgba(0, 0, 0, 0.5);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
    color: transparent;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
    color: transparent;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
    color: transparent;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
    color: transparent;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
    color: transparent;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
    color: transparent;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
    color: transparent;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
    color: transparent;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
    color: transparent;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
    color: black;
    text-shadow: 0 0 0px rgba(0, 0, 0, 0.5);
  }
}
@keyframes spin {
  0% {
    transform: rotate3d(0, 1, 0, 0deg);
  }
  100% {
    transform: rotate3d(0, 1, 0, 360deg);
  }
}
@keyframes scrollToLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-155vw);
  }
}
@keyframes scrollToRight {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(150vw);
  }
}
</style>