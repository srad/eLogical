<template>
  <b-container>
    <b-row>
      <b-col>
        <h4><strong>Level {{level}}</strong></h4>
      </b-col>

      <b-col class="text-right">
        <progresser v-bind:max="progress.max" v-bind:current="progress.current"/>
      </b-col>
    </b-row>

    <hr/>
<<<<<<< HEAD
    <tex v-bind:expression="expression"></tex>
    <tree v-bind:treeData="treeData" class="tree"></tree>
    <hr/>

    <b-form-group label="Set the values">
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
=======
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
>>>>>>> 179d8d0774a6696b9c19e777cda03b691559dae9

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
      level: 1,
      progress: {
        max: 5,
        current: 0,
      },
      selected: [],
      options: [],
<<<<<<< HEAD
      expression: "",
      treeData: {nodes: [], edges: []},
=======
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
>>>>>>> 179d8d0774a6696b9c19e777cda03b691559dae9
    };
  },
  computed: {
    selection() {
      let params = {};
      this.options.forEach(o => params[o] = false);
      this.selected.forEach(s => params[s] = true);
<<<<<<< HEAD
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
=======
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
>>>>>>> 179d8d0774a6696b9c19e777cda03b691559dae9
    },
    generateExercise() {
      this.selected = [];
      const {tree, solution} = randBoolExpr(2, this.level, this.vars);
      console.log(solution);
      this.tree = tree;
      this.options = this.tree.vars.map(v => {
        return {text: v, value: v};
      });

<<<<<<< HEAD
      const {nodes, edges} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      this.expression = "\\phi =" + this.tree.to("tex");
      const treeNodes = new Set(nodes.filter(node => typeof node.type === "string").map(node => node.label));
      this.options = Array.from(treeNodes).sort((a, b) => a - b);
    },
=======
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
>>>>>>> 179d8d0774a6696b9c19e777cda03b691559dae9
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style>
.tree {
<<<<<<< HEAD
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: 9%;
  top: 30%;
=======
  height: 30em;
>>>>>>> 179d8d0774a6696b9c19e777cda03b691559dae9
}
</style>
