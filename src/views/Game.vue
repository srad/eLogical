<template>
  <div style="margin-top: -0.5rem">
      <b-row align-v="center" class="notification tutorial-text-row ml-0" ref="notification" v-on:click="progressTutorial">
        <b-col cols="12" class="text-center">{{tutorial.currentText}}</b-col>
      </b-row>
    <div class="backdrop-click" v-if="tutorial.isRunning" v-on:click="progressTutorial"></div>
    <div class="backdrop" ref="backdropTop" v-show="tutorial.isRunning"></div>
    <div class="backdrop" ref="backdropLeft" v-show="tutorial.isRunning"></div>
    <div class="backdrop" ref="backdropRight" v-show="tutorial.isRunning"></div>
    <div class="backdrop" ref="backdropBottom" v-show="tutorial.isRunning"></div>
    <h1 ref="difficultyTitle" class="title-difficulty">Chapter {{progress.difficulty}}</h1>
    <b-row class="pt-3 pb-2 bg-white p-0 mb-3 border-bottom shadow-sm" align-v="center">
      <b-col cols="3">
        <h5>
          <strong>Level:</strong>
        </h5>
      </b-col>

      <b-col aria-colcount="9" class="pl-0 ml-0">
        <b-progress
          class="bg-secondary h-75 shadow-sm"
          :current="progress.currLevel"
          :max="progress.maxLevel"
        >
          <block-bar :colors="colors" :current="progress.currLevel" :max="progress.maxLevel" v-on:level-finished="cleanup" />
        </b-progress>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col cols="6" class="text-left">
        <ressource
          animate
          hide-animation-class="flash"
          icon="heart"
          color="darkred"
          class="text-danger"
          v-bind:max="health.max"
          v-bind:current="health.current"
          ref="health"
        />
      </b-col>
      <b-col cols="6" class="text-right">
        <ressource
          animate
          hide-animation-class="swing"
          icon="dice"
          v-on:click="rerollExpression"
          color="goldenrod"
          class="text-warning"
          v-bind:max="rerolls.max"
          v-bind:current="rerolls.current"
          ref="rerolls"
        />
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col>
        <b-card
          v-bind:class="{'animated slow shake': success===false, 'animated tada': success===true}"
          body-class="p-1"
          bg-variant="white"
          header="Make this formula true"
          :header-bg-variant="success===false?'danger':'primary'"
          header-class="p-1 text-center text-white"
          class="shadow-sm border-dark"
          ref="expression"
        >
          <b-card-text class="p-0 m-0 text-center">
            <tex v-bind:expression="expression"></tex>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="mb-3"  v-if="progress.currLevel === progress.maxLevel - 1" align-h="start">
      <b-col cols="1" class="text-right bones-icon">
        <font-awesome-icon icon="skull-crossbones" size="lg" />
      </b-col>
      <b-col cols="11" class="text-left">
        <stopwatch
          ref="stopwatch"
          class="stopwatch"
          :time="stopwatchTime"
          :countingDown="true"
          v-on:timer-ended="gameOver"
        ></stopwatch>
      </b-col>
    </b-row>

    <b-row align-h="center">
      <b-col cols="10" class="text-center">
        <tree v-bind:treeData="treeData" class="tree" ref="tree"></tree>
      </b-col>
    </b-row>
    <hr />
    <b-row class="mt-4">
      <b-col cols="9" align-self="center" class="text-center">
        <b-row ref="buttons" align-h="center" align-v="center">
          <b-col cols="3" lg="2" v-for="(node, index) in options"
          :key="node.name" class="text-center mb-2">
          <b-button
            :ref="'btnSelect'+index"
            :variant="node.selected ? 'primary true' : 'danger false'"
            @click="toggleVariable(node.name, index)"
            size="lg"
            class="p-2 pl-3 pr-3 faster"
        >{{node.name}}</b-button>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="3" md="2" lg="1" align-self="end">
        <b-button
          variant="primary"
          class="confirm shadow-sm"
          ref="confirm"
          size="lg"
          v-on:click="confirm"
        >
          <font-awesome-icon icon="check" />
        </b-button>
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
            <router-link to="/leaderboard">
              <b-button variant="primary" size="lg" block>Leaderboard</b-button>
            </router-link>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Good Job! Choose your Loot'">
          <b-container>
            <b-row v-if="rerolls.current === rerolls.max && health.current === health.max">
              <b-col class="text-center">
                <font-awesome-icon
                  ref="dice-icon"
                  size="6x"
                  class="dice-selected"
                  icon="trophy"
                ></font-awesome-icon>
              </b-col>
            </b-row>
            <b-row v-if="rerolls.current === rerolls.max && health.current === health.max">
              <b-col class="text-center">
                WOW! Your ressources are still maxed out! Keep it up!
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="6" v-if="rerolls.current < rerolls.max">
                <font-awesome-icon
                  ref="dice-icon"
                  size="6x"
                  class="loot-unselected"
                  icon="dice"
                  v-on:click="pickLoot('dice')"
                ></font-awesome-icon>
              </b-col>
              <b-col cols="6" v-if="health.current < health.max">
                <font-awesome-icon
                  ref="heart-icon"
                  size="6x"
                  class="loot-unselected"
                  icon="heart"
                  v-on:click="pickLoot('heart')"
                ></font-awesome-icon>
              </b-col>
            </b-row>
            <b-row class="mt-4" align-h="center">
              <b-col cols="6">
                <b-button
                  variant="primary"
                  size="lg"
                  block
                  v-on:click="loadNextChapter"
                  :disabled="(health.current < health.max || rerolls.current < rerolls.max) && loot.selected === null"
                >Next Chapter</b-button>
              </b-col>
            </b-row>
          </b-container>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Welcome!' && tutorial.proposed === false">
          <b-container>
            <b-row>
              <b-col
                class="text-center"
              >Welcome to eLogical! Do you want to play through a quick tutorial?</b-col>
            </b-row>
            <b-row class="mt-4">
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
import { ConstNode } from "../lib/compiler/tree";
import Stopwatch from "../components/Stopwatch";
import Ressource from "../components/Ressource";
import BlockBar from "../components/BlockBar";
import colors from "@/lib/colors";

export default {
  name: "Game",
  components: { Tree, Tex, Stopwatch, Ressource, BlockBar },
  props: {},
  data() {
    return {
      progress: {
        difficulty: 1,
        currLevel: 0,
        maxLevel: 5
      },
      success: null,
      health: {
        current: 3,
        max: 3
      },
      rerolls: {
        current: 3,
        max: 3
      },
      selected: [],
      options: [],
      nodeId: 0,
      colors: colors.gradient.purple,
      expression: "",
      modalText: "Welcome!",
      loot: {
        selected: null,
        bagpack: []
      },
      treeData: { nodes: [], edges: [] },
      tree: undefined,
      texOptions: [],
      difficultySettings: {
        1: ["and", "or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"]
      },
      tutorial: {
        proposed: localStorage.tutorialProposed || false,
        isRunning: false,
        currentStep: 0,
        currentText: ""
      }
    };
  },
    watch: {
    tree(node) {
      if (node instanceof ConstNode) {
        this.select(node.v);
      }
      this.expression =
        (this.nodeId === 0 ? "\\phi = " : "") + node.to("tex", { color: true });
    }
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
    },
    tutorialData() {
      switch (this.tutorial.currentStep) {
        case 1:
          return {
            element: this.$refs["expression"],
            text: "The goal is to make this evaluate to 'true'."
          };
          break;
        case 2:
          return {
            element: this.$refs["tree"].$el,
            text: "This visualizaion can be helpful, too!"
          };
        case 3:
          return {
            element: this.$refs["buttons"],
            text: "You can configure the variables using these buttons."
          };
        case 4:
          return {
            element: this.$refs["confirm"],
            text: "You have to confirm your configuration."
          };
        case 5:
          return {
            element: this.$refs["health"].$el,
            text: "You can take damage if your input is wrong!"
          };
        case 6:
          return {
            element: this.$refs["rerolls"].$el,
            text:
              "If you don't like the current expression you can reroll it using these."
          };
        default:
          return {
            element: null,
            text: "That's it! Have fun playing the game!"
          };
      }
    }
  },
  methods: {
    toggleVariable(node, index) {
      this.options[index].selected = !this.options[index].selected
    },
    rerollExpression() {
      if(this.rerolls.current > 0){
        this.$refs["expression"].classList.add("text-reroll");
        if (this.progress.currLevel === this.progress.maxLevel -1) {
          this.$refs["stopwatch"].stopTimer();
          this.$refs["stopwatch"].setupTimer();
        }
        setTimeout(() => {
          this.generateExercise();
        }, 500);
        this.rerolls.current--
      }
    },
    takeDamage() {
      if (navigator.vibrate) {
        navigator.vibrate(250);
      }
      this.health.current--;
      if (this.health.current === 0) {
        this.gameOver();
      }
    },
    confirm() {
      const selection = {};
      this.options.forEach(o => (selection[o.name] = o.selected));
      const isAnswerCorrect = this.tree.evaluate(selection);
      this.success = isAnswerCorrect;
      if (this.success) {
        if(this.progress.currLevel < this.progress.maxLevel){
          this.progress.currLevel++;
        }
      }else {
        this.takeDamage()
      }
    },
    pickLoot(loot) {
      this.loot.selected = loot;
      switch (loot) {
        case "dice":
          this.$refs["dice-icon"].classList.add("dice-selected");
          this.$refs["dice-icon"].classList.remove("loot-unselected");
          if(this.health.current < this.health.max){
            this.$refs["heart-icon"].classList.add("loot-unselected");
            this.$refs["heart-icon"].classList.remove("heart-selected");
          }
          break;
        case "heart":
          this.$refs["heart-icon"].classList.add("heart-selected");
          this.$refs["heart-icon"].classList.remove("loot-unselected");
          if(this.rerolls.current < this.rerolls.max){
            this.$refs["dice-icon"].classList.add("loot-unselected");
            this.$refs["dice-icon"].classList.remove("dice-selected");
          }
          break;
      }
    },
    emptyBackpack() {
      this.loot.bagpack.forEach(loot => {
        switch (loot) {
          case "heart":
            if(this.health.current < this.health.max){
              this.health.current++;
            }
            break;
          case "dice":
            if(this.rerolls.current < this.rerolls.max){
              this.rerolls.current++; 
            }
            break;
        }
        this.loot.bagpack = [];
      });
    },
    cleanup(){
        if(this.progress.currLevel === this.progress.maxLevel){
          this.modalText = "Good Job! Choose your Loot";
          this.$refs["modal"].show();
        }
        else {
          this.generateExercise();
        }

    },
    loadNextChapter() {
      this.progress.currLevel = 0;
      this.progress.difficulty++;
      this.loot.bagpack.push(this.loot.selected);
      if(this.loot.selected === "heart"){
        this.$refs["heart-icon"].classList.remove("heart-selected");
        this.$refs["heart-icon"].classList.add("loot-unselected");
      } else if(this.loot.selected === "dice"){
        this.$refs["dice-icon"].classList.remove("dice-selected");
        this.$refs["dice-icon"].classList.add("loot-unselected");
      }
      this.loot.selected = null;
      this.$refs["modal"].hide();
      this.generateExercise();
    },
    generateExercise() {
      this.nodeId = 0; // Reset any tree click
      // Generate tree
      const { tree } = randBoolExpr({
        setSize: 2,
        maxDepth: this.progress.difficulty,
        vars: this.vars,
        expWhiteList: this.functions
      });
      this.tree = tree;
      // Draw tree
      const { nodes, edges, leafs } = this.tree.toGraph();
      this.treeData = { nodes, edges };
      // TODO: Show only yes/no answer
      this.singleChoice = leafs.length === 0;
      if (!this.singleChoice) {
        this.options = leafs
          .map(node => ({ name: node.v, color: node.color, selected: false }))
          .sort((a, b) => a.name.localeCompare(b.name));
        this.texOptions = leafs.map(node => node.to("tex")).sort();
      }
      this.emptyBackpack();
      if (this.progress.currLevel === this.progress.maxLevel -1) {
          this.$refs["stopwatch"].startTimer();
      } 
      if (this.tutorial.proposed && this.progress.currLevel === 0) {
        this.slideInTitle();
      }
    },
    slideInTitle() {
      this.$refs["difficultyTitle"].classList.add("scroll-to-right");
    },
    resetGame() {
      this.generateExercise();
      this.modalText = "";
      this.$refs["modal"].hide();
      this.progress.currLevel = 0;
      this.progress.difficulty = 1;
      this.health.current = 3;
      this.rerolls.current = 3;
    },
    gameOver() {
      this.modalText = "Game Over!";
      this.$refs["modal"].show();
      this.addLeaderboardEntry("player1", this.calculatePoints());
    },
    highlightElement(el) {
      let topDrop = this.$refs["backdropTop"],
        botDrop = this.$refs["backdropBottom"],
        leftDrop = this.$refs["backdropLeft"],
        rightDrop = this.$refs["backdropRight"];
      if (el === null) {
        topDrop.style.height = document.documentElement.clientHeight + "px";
        topDrop.style.width = document.documentElement.clientWidth + "px";
        topDrop.style.left = "0";
        topDrop.style.top = "0";
        botDrop.style.display = "none";
        rightDrop.style.display = "none";
        leftDrop.style.display = "none";
      } else {
        let bounds = el.getBoundingClientRect();
        topDrop.style.height = bounds.top + "px";
        topDrop.style.width = bounds.width + "px";
        topDrop.style.left = bounds.left + "px";
        topDrop.style.top = "0";
        botDrop.style.height =
          document.documentElement.clientHeight - bounds.bottom + "px";
        botDrop.style.width = bounds.width + "px";
        botDrop.style.left = bounds.left + "px";
        botDrop.style.top = bounds.bottom + "px";
        leftDrop.style.left = "0";
        leftDrop.style.top = "0";
        leftDrop.style.height = document.documentElement.clientHeight + "px";
        leftDrop.style.width = bounds.left + "px";
        rightDrop.style.top = "0";
        rightDrop.style.left = bounds.left + bounds.width + "px";
        rightDrop.style.width =
          document.documentElement.clientWidth -
          (bounds.left + bounds.width) +
          "px";
        rightDrop.style.height = document.documentElement.clientHeight + "px";
      }
    },
    skipTutorial() {
      localStorage.tutorialProposed = true;
      this.$refs["modal"].hide();
      this.slideInTitle();
    },
    startTutorial() {
      localStorage.tutorialProposed = true;
      this.tutorial.isRunning = true;
      this.$refs["modal"].hide();
      this.$refs["notification"].classList.add("notification-visible");
      this.progressTutorial();
    },
    progressTutorial() {
      this.tutorial.currentStep++;
      if (this.tutorial.currentStep < 8) {
        let tutorialData = this.tutorialData;
        this.tutorial.currentText = tutorialData.text;
        this.highlightElement(tutorialData.element);
      } else {
        this.stopTutorial();
      }
    },
    stopTutorial() {
      let topDrop = this.$refs["backdropTop"],
        botDrop = this.$refs["backdropBottom"],
        leftDrop = this.$refs["backdropLeft"],
        rightDrop = this.$refs["backdropRight"];
      this.tutorial.isRunning = false;
      topDrop.style.display = "none";
      botDrop.style.display = "none";
      leftDrop.style.display = "none";
      rightDrop.style.display = "none";
      this.$refs["notification"].classList.add("notification-hidden");
      this.$refs["notification"].classList.remove("notification-visible");
      this.slideInTitle();
    },
    addLeaderboardEntry(name, points) {
      this.$api.saveAnswer({
        level: { current: this.progress.currLevel },
        progress: { current: this.progress.difficulty },
        score: points
      });
    },
    calculatePoints() {
      var points =
        (this.progress.difficulty - 1) * 5 + this.progress.currLevel;
      console.log("Points: " + points);
      return points;
    }
  },
  mounted() {
    this.generateExercise();
    if (!this.tutorial.proposed) {
      this.modalText = "Welcome!";
      this.$refs["modal"].show();
    }
    //configure what should happen after the various animations
    this.$refs["difficultyTitle"].addEventListener("animationend", () => {
      this.$refs["difficultyTitle"].classList.remove("scroll-to-right");
    });
    
    this.$refs["expression"].addEventListener("animationend", () => {
      this.$refs["expression"].classList.remove("tada");
      this.$refs["expression"].classList.remove("shake");
      this.$refs["expression"].classList.remove("animated");
      this.$refs["expression"].classList.remove("text-reroll");
      this.success = undefined
    });
  }
};
</script>

<style>
.tree {
  height: 40vh;
}
.tex {
  font-size: 1.5em;
}
.tree,
.confirm,
.bones-icon,
.stopwatch {
  animation: slideInFromTop 1s;
}
.notification {
  z-index: 1032;
  position: fixed;
  top: -3.5em;
  width: 90%;
}
.notification-hidden {
  top: -3.5em;
  opacity: 1;
  transition: all 0.5s;
}
.notification-visible {
  top: 0;
  opacity: 1;
  transition: all 0.5s;
}
.tutorial-text-row {
  height: 3em;
  background-color: #fefefe;
  border-radius: 0 0 0.5em 0.5em;
  -webkit-box-shadow: 2px 3px 2px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 2px 3px 2px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 2px 3px 2px 0px rgba(0, 0, 0, 0.5);
}
.backdrop-click {
  z-index: 1032;
  position: absolute;
  opacity: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.backdrop {
  z-index: 1031;
  position: absolute;
  background-color: rgb(0, 0, 0);
  opacity: 0.6;
  width: 100%;
  height: 100%;
}
.true {
  color: white;
  animation: spinTrue 0.5s;
  animation-fill-mode: forwards;
}
.true:hover {
  background-color: #1e7e34;
  color: white;
}
.false {
  color: white;
  animation: spinFalse 0.5s;
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
.title-difficulty {
  z-index: 999;
  font-size: 4em;
  position: fixed;
  top: 50vh;
  left: -5em;
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
  }
  100% {
    transform: rotate3d(0, 1, 0, 360deg);
    background-color: #28a745;
  }
}
@keyframes spinFalse {
  0% {
    transform: rotate3d(0, 1, 0, 0deg);
    background-color: #28a745;
  }
  100% {
    transform: rotate3d(0, 1, 0, 360deg);
    background-color: #dc3545;
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
@keyframes scrollToRight {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(150vw);
  }
}
</style>