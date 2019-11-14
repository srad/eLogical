<template>
  <div class="pt-4 pr-3 pl-3">
    <div class="backdrop" ref="backdropLeft" v-show="backdropVisible"></div>
    <div class="backdrop" ref="backdropRight" v-show="backdropVisible"></div>
    <div class="backdrop" ref="backdropTop" v-show="backdropVisible"></div>
    <div class="backdrop" ref="backdropBottom" v-show="backdropVisible"></div>
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
        <tex v-bind:expression="expression" ref="tex" class="tex"></tex>
      </b-col>
    </b-row>
    <hr />
    <stopwatch
      v-if="progress.currLevel === progress.maxLevel"
      ref="stopwatch"
      class="stopwatch"
      :time="stopwatchTime"
      :countingDown="true"
      :showIcon="false"
      v-on:timer-ended="gameOver"
    ></stopwatch>

      <b-row align-h="center">
        <b-col cols="6" class="text-center">
          <tree v-bind:treeData="treeData" class="tree" ref="tree"></tree>
        </b-col>
      </b-row>
    <b-row align-h="center">
      <b-col cols="6" sm="4" lg="2" :key="v" v-for="v in options" class="text-center">
        <button v-on:click="toggleVariable(v)" class="selector false" :ref="v">{{v}}</button>
      </b-col>
    </b-row>

    <b-row class="text-center">
      <b-col>
        <b-button variant="primary" class="confirm" ref="confirm" size="lg" v-on:click="confirm">Confirm</b-button>
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
        <b-row align-h="center" v-if="modalText === 'Good Job! Choose your Loot'">
          <b-col cols="6">
            <font-awesome-icon
              ref="dice-icon"
              size="6x"
              class="loot-unselected"
              icon="dice"
              v-on:click="pickLoot('dice')"
            ></font-awesome-icon>
          </b-col>
          <b-col cols="6">
            <font-awesome-icon
              ref="heart-icon"
              size="6x"
              class="loot-unselected"
              icon="heart"
              v-on:click="pickLoot('heart')"
            ></font-awesome-icon>
          </b-col>
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="loadNextChapter">Next Chapter</b-button>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Welcome!' && tutorialProposed === false">
          <b-container>
            <b-row>
              <b-col>
                Welcome to eLogical! Do you want to play through a quick tutorial?
              </b-col>
              <b-col>
                <font-awesome-icon size="6x" class="loot-tutorial" icon="question"></font-awesome-icon>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-button variant="success" size="lg" block v-on:click="startTutorial">Sure</b-button>
              </b-col>
              <b-col>
                <b-button variant="danger" size="lg" block v-on:click="skipTutorial">No</b-button>
              </b-col>
            </b-row>
          </b-container>
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
import APIService from "../services/APIService";
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
      modalText: "Welcome!",
      loot: {
        selected: null,
        bagpack: []
      },
      treeData: { nodes: [], edges: [] },
      difficultySettings: {
        1: ["and", "or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"]
      },
      tutorialProposed: false,
      backdropVisible: false
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
      if (pos > -1) {
        this.selected.splice(pos, 1);
        this.$refs[value][0].classList.remove("true");
        this.$refs[value][0].classList.add("false");
      } else {
        this.selected.push(value);
        this.$refs[value][0].classList.remove("false");
        this.$refs[value][0].classList.add("true");
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
          this.modalText = "Good Job! Choose your Loot";
          this.$refs["modal"].show();
          this.$refs["stopwatch"].stopTimer();
          return;
        } else {
          this.progress.currLevel++;
        }
        this.$refs["tex"].$el.classList.add("tex-right");
        setTimeout(() => {
          this.$refs["tex"].$el.classList.remove("tex-right");
          this.options.forEach(opt => {
            this.$refs[opt][0].classList.remove("true");
            this.$refs[opt][0].classList.remove("false");
            this.$refs[opt][0].classList.add("false");
          });
          this.generateExercise();
        }, 2000);
      } else {
        if (navigator.vibrate) {
          navigator.vibrate(250);
        }
        this.$refs["tex"].$el.classList.add("tex-wrong");
        this.$refs["healthbar"].despawnLife();
        setTimeout(() => {
          this.$refs["tex"].$el.classList.remove("tex-wrong");
          this.health--;
          if (this.health === 0) {
            this.gameOver();
          }
        }, 3000);
      }
      this.highlightElement(this.$refs["healthbar"].$el)
    },
    pickLoot(loot) {
      this.loot.selected = loot;
      switch (loot) {
        case "dice":
          this.$refs["dice-icon"].classList.add("dice-selected");
          this.$refs["dice-icon"].classList.remove("loot-unselected");
          this.$refs["heart-icon"].classList.add("loot-unselected");
          this.$refs["heart-icon"].classList.remove("heart-selected");
          break;
        case "heart":
          this.$refs["heart-icon"].classList.add("heart-selected");
          this.$refs["heart-icon"].classList.remove("loot-unselected");
          this.$refs["dice-icon"].classList.add("loot-unselected");
          this.$refs["dice-icon"].classList.remove("dice-selected");
          break;
      }
    },
    emptyBackpack() {
      this.loot.bagpack.forEach(loot => {
        switch (loot) {
          case "heart":
            this.health++;
            break;
          case "dice":
            this.rerolls++;
            break;
        }
        this.loot.bagpack = [];
      });
    },
    loadNextChapter() {
      this.progress.currLevel = 1;
      this.progress.difficulty++;
      this.loot.bagpack.push(this.loot.selected);
      this.loot.selected = null;
      this.$refs["heart-icon"].classList.remove("heart-selected");
      this.$refs["dice-icon"].classList.remove("dice-selected");
      this.$refs["heart-icon"].classList.add("loot-unselected");
      this.$refs["dice-icon"].classList.add("loot-unselected");
      this.$refs["modal"].hide();
      this.generateExercise();
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
      this.emptyBackpack();
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
      this.addLeaderboardEntry("player1", this.calculatePoints());
    },
    printMessage(msg) {
      alert(msg);
    },
    highlightElement(el){
      let topDrop = this.$refs["backdropTop"],
          botDrop = this.$refs["backdropBottom"],
          leftDrop = this.$refs["backdropLeft"],
          rightDrop = this.$refs["backdropRight"],
          bounds = el.getBoundingClientRect()
      topDrop.style.height = bounds.top+"px"
      topDrop.style.width = bounds.width+"px"
      topDrop.style.left = bounds.left+"px"
      topDrop.style.top = "0"
      botDrop.style.height = window.screen.height - bounds.bottom+"px"
      botDrop.style.width = bounds.width+"px"
      botDrop.style.left = bounds.left+"px"
      botDrop.style.top = bounds.top+bounds.height+"px"
      leftDrop.style.left = "0"
      leftDrop.style.top = "0"
      leftDrop.style.width = bounds.left+"px"
      rightDrop.style.top = "0"
      rightDrop.style.left = bounds.left+bounds.width+"px"
      rightDrop.style.width = window.screen.width - (bounds.left+bounds.width)+"px"
      this.backdropVisible = true
      console.warn(bounds)
    },
    skipTutorial(){
      this.tutorialProposed = true;
      this.$refs["modal"].hide();
    },
    startTutorial(){
      this.tutorialProposed = true;
      this.$refs["modal"].hide();
    },
    addLeaderboardEntry(name, points) {
      APIService.addLeaderboardEntries(name, points);
    },
    calculatePoints() {
      var points =
        (this.progress.difficulty - 1) * 5 + this.progress.currLevel - 1;
      console.log("Points: " + points);
      return points;
    }
  },
  mounted() {
    this.generateExercise();
    if(!this.tutorialProposed){
      this.modalText = "Welcome!"
      this.$refs["modal"].show();
    }
  }
};
</script>

<style>
.tree {
  height: 20vh;
}
.tex {
  font-size: 1.5em;
}
.tex-right {
  animation: texRight 2s;
  animation-fill-mode: forwards;
}
.tex-wrong {
  animation: texWrong 2s;
}
.tree,
.confirm,
.selector,
.stopwatch {
  animation: slideInFromTop 1s;
}
.selector {
  width: 15vh;
  height: 15vh;
  color: white;
  border-radius: 2px;
  border-color: transparent;
  margin-bottom: 1em;
  font-size: 3em;
}
.backdrop {
  z-index: 999;
  position: absolute;
  background-color: rgb(0, 0, 0);
  opacity: 0.9;
  width: 100%;
  height: 100%;
}
.true {
  animation: spinTrue 1s;
  animation-fill-mode: forwards;
}
.true:hover {
  background-color: #1e7e34;
  color: white;
}
.false {
  animation: spinFalse 1s;
  animation-fill-mode: forwards;
}
.false:hover {
  background-color: #c82333;
  color: white;
}
.dice-selected {
  color: goldenrod;
  transition: all 1s;
}
.heart-selected {
  color: darkred;
  transition: all 1s;
}
.loot-unselected {
  color: darkgray;
  transition: all 1s;
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
@keyframes spinTrue {
  0% {
    transform: rotate3d(0, 1, 0, 0deg);
    background-color: #dc3545;
    box-shadow: 0 0 5px #f1031b;
  }
  100% {
    transform: rotate3d(0, 1, 0, 360deg);
    background-color: #28a745;
    box-shadow: 0 0 5px #05ec3b;
  }
}
@keyframes spinFalse {
  0% {
    transform: rotate3d(0, 1, 0, 0deg);
    background-color: #28a745;
    box-shadow: 0 0 5px #05ec3b;
  }
  100% {
    transform: rotate3d(0, 1, 0, 360deg);
    background-color: #dc3545;
    box-shadow: 0 0 5px #f1031b;
  }
}
@keyframes slideInFromTop {
  0% {
    transform: translateY(-3em);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
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
@keyframes texRight {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    transform: scale(0.5);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    color: green;
  }
  75% {
    transform: scale(1.5);
    color: green;
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    color: green;
    transform: translateY(-3em);
    opacity: 0;
  }
}
@keyframes texWrong {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(5px);
    color: red;
  }
  20% {
    transform: translateX(-5px);
  }
  30% {
    transform: translateX(5px);
    color: red;
  }
  40% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
    color: red;
  }
  60% {
    transform: translateX(-5px);
  }
  70% {
    transform: translateX(5px);
    color: red;
  }
  100% {
    transform: translateX(-5px);
  }
}
</style>