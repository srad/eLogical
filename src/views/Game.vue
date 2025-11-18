<template>
  <div class="game-wrapper d-flex flex-column">
    <!-- Tutorial notification (fixed) -->
    <div class="notification tutorial-text-row row align-items-center ml-0" :class="showNotification ? 'notification-visible' : 'notification-hidden'" @click="progressTutorial">
      <div class="col-12 text-center">{{ tutorial.currentText }}</div>
    </div>

    <!-- Tutorial backdrop overlays (fixed) -->
    <div class="backdrop-click" v-if="tutorial.isRunning" @click="progressTutorial"></div>
    <div
        class="backdrop"
        v-if="drop.top.display"
        v-show="tutorial.isRunning"
        :style="{
        top: drop.top.top,
        height: drop.top.height,
        width: drop.top.width,
        left: drop.top.left,
      }"
    ></div>
    <div
        class="backdrop"
        v-if="drop.left.display"
        v-show="tutorial.isRunning"
        :style="{
        top: drop.left.top,
        height: drop.left.height,
        width: drop.left.width,
        left: drop.left.left,
      }"
    ></div>
    <div
        class="backdrop"
        v-if="drop.right.display"
        v-show="tutorial.isRunning"
        :style="{
        top: drop.right.top,
        height: drop.right.height,
        width: drop.right.width,
        left: drop.right.left,
      }"
    ></div>
    <div
        class="backdrop"
        v-if="drop.bottom.display"
        v-show="tutorial.isRunning"
        :style="{
        top: drop.bottom.top,
        height: drop.bottom.height,
        width: drop.bottom.width,
        left: drop.bottom.left,
      }"
    ></div>

    <!-- Difficulty title -->
    <h1 class="title-difficulty" :class="{ 'scroll-to-right': showTitleAnimation }">Level {{ info.level }}</h1>

    <!-- Game header section -->
    <div class="game-header">
      <!-- Exercise progress section -->
      <div class="d-flex align-items-center gap-2 justify-content-center">
        <div class="fw-bold">Wins</div>
        <div class="flex-grow-1">
          <BlockBar :colors="blockBarColors" :current="info.currentExercise" :max="info.totalExercises"/>
        </div>
      </div>

      <!-- Health and rerolls section -->
      <div class="d-flex justify-content-between w-100">
        <ressource animate hide-animation-class="flash" icon="heart" color="darkred" class="text-danger" :max="health.max" :current="health.current"/>
        <ressource animate hide-animation-class="swing" icon="dice" color="goldenrod" class="text-warning" :max="rerolls.max" :current="rerolls.current"/>
      </div>

      <!-- Expression card -->
      <div>
        <div
            :class="{
            'animated slow shake': success === false,
            'animated tada': success === true,
            'text-reroll': isRerolling,
          }"
            class="card shadow-sm border-dark"
        >
          <div class="card-header" :class="success === false ? 'bg-danger' : 'bg-primary'" style="color: white">Make this formula true</div>
          <div class="card-body text-center">
            <tex :expression="expression"></tex>
          </div>
        </div>
      </div>
    </div>

    <!-- Game middle section (tree) -->
    <div class="game-middle">
      <Tree :treeData="treeData" class="w-100 h-100"></Tree>

      <!-- Stopwatch section (final level only) -->
      <div id="countdown" class="d-flex text-start gap-2 position-absolute top-0 start-0 w-100 py-2" style="max-width: 50%" v-if="info.currentExercise === info.totalExercises - 1">
        <div class="bones-icon">
          <font-awesome-icon icon="stopwatch" size="2x"/>
        </div>
        <div class="flex-grow-1">
          <stopwatch ref="stopwatch" class="stopwatch" :time="stopwatchTime" :countingDown="true" @timer-ended="gameOver"></stopwatch>
        </div>
      </div>

      <!-- Reroll button positioned at top-right -->
      <div class="position-absolute top-0 end-0">
        <button class="btn text-warning d-flex align-items-center justify-content-center gap-2" @click="rerollExpression" :disabled="rerolls.current === 0" title="Reroll the expression">
          <font-awesome-icon icon="dice" size="2x"/>
          <span class="d-none d-md-inline">{{ rerolls.current }}</span>
        </button>
      </div>
    </div>

    <!-- Game footer section -->
    <div class="game-footer">
      <div class="d-flex justify-content-between align-items-center w-100">
        <div class="d-flex gap-2 flex-wrap">
          <button v-for="(node, index) in options" :key="node.name" :class="node.selected ? 'btn-primary' : 'btn-danger'" class="btn" @click="toggleVariable(node.name, index)">
            {{ formatLabelWithSubscripts(node.name) }}
          </button>
        </div>

        <button class="btn btn-dark ms-2" @click="confirm">
          <font-awesome-icon icon="check" size="lg"/>
        </button>
      </div>
    </div>

    <!-- Answer feedback component -->
    <AnswerFeedback :isVisible="showFeedback" :isCorrect="feedbackIsCorrect" @hide="hideFeedback"/>

    <!-- Modal dialog -->
    <div class="modal fade" ref="modalElement" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalText }}</h5>
          </div>
          <div class="modal-body">
            <!-- Game Over modal -->
            <div v-if="modalText === 'Game Over!'" class="container-fluid">
              <div class="row mb-3" style="justify-content: center">
                <div class="col-6">
                  <button class="btn btn-primary w-100" @click="resetGame">Try Again</button>
                </div>
              </div>
              <div class="row" style="justify-content: center">
                <div class="col-6">
                  <button class="btn btn-primary w-100" @click="goToHighscores">My High Scores</button>
                </div>
              </div>
            </div>

            <!-- Loot selection modal -->
            <div v-if="modalState === ModalState.won" class="container-fluid">
              <div v-if="rerolls.current === rerolls.max && health.current === health.max" class="row">
                <div class="col text-center">
                  <font-awesome-icon size="6x" class="trophy-icon" icon="trophy"></font-awesome-icon>
                </div>
              </div>
              <div v-if="rerolls.current === rerolls.max && health.current === health.max" class="row">
                <div class="col text-center">WOW! Your ressources are still maxed out! Keep it up!</div>
              </div>
              <div class="row loot-selection mt-4">
                <div class="col-6 text-center" v-if="rerolls.current < rerolls.max">
                  <div class="loot-item-wrapper">
                    <font-awesome-icon size="6x" :class="loot.selected === 'dice' ? 'dice-selected' : 'loot-unselected'" icon="dice" @click="pickLoot('dice')"></font-awesome-icon>
                    <p class="loot-label">Reroll</p>
                  </div>
                </div>
                <div class="col-6 text-center" v-if="health.current < health.max">
                  <div class="loot-item-wrapper">
                    <font-awesome-icon size="6x" :class="loot.selected === 'heart' ? 'heart-selected' : 'loot-unselected'" icon="heart" @click="pickLoot('heart')"></font-awesome-icon>
                    <p class="loot-label">Health</p>
                  </div>
                </div>
              </div>
              <div class="row mt-4" style="justify-content: center">
                <div class="col-6">
                  <button class="btn btn-primary w-100" @click="nextLevel" :disabled="(health.current < health.max || rerolls.current < rerolls.max) && loot.selected === null">Next Level</button>
                </div>
              </div>
            </div>

            <!-- Welcome modal -->
            <div v-if="modalState === ModalState.welcome" class="container-fluid">
              <div class="row">
                <div class="col text-center">Welcome to eLogical! Do you want to play through a quick tutorial?</div>
              </div>
              <div class="row mt-4">
                <div class="col">
                  <button class="btn btn-success w-100" @click="startTutorial">Sure</button>
                </div>
                <div class="col">
                  <button class="btn btn-danger w-100" @click="skipTutorial">No</button>
                </div>
              </div>
            </div>

            <!-- Game start confirmation modal -->
            <div v-if="modalState === ModalState.ready" class="container-fluid">
              <div class="row">
                <div class="col text-center">
                  <h4>Are you ready to start?</h4>
                </div>
              </div>
              <div class="row mt-4" style="justify-content: center">
                <div class="col-6">
                  <button class="btn btn-success w-100" @click="startGame">Let's Go!</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { randBoolExpr } from "@/lib/compiler/generator";
import Tree from "../components/Tree.vue";
import Tex from "../components/Tex.vue";
import Stopwatch from "../components/Stopwatch.vue";
import Ressource from "../components/Ressource.vue";
import BlockBar from "../components/BlockBar.vue";
import AnswerFeedback from "../components/AnswerFeedback.vue";
import colors from "@/lib/colors";
import EventType from "@/services/events";
import { Modal } from "bootstrap";
import confetti from "canvas-confetti";

const router = useRouter();

enum ModalState { gameOver, won, default, ready, tutorial, welcome }

interface LevelInfo {
  level: number;
  currentExercise: number;
  totalExercises: number;
}

interface Resource {
  current: number;
  max: number;
}

interface Option {
  name: string;
  color: string;
  selected: boolean;
}

interface Loot {
  selected: string | null;
  bagpack: string[];
}

interface TreeData {
  nodes: any[];
  edges: any[];
}

interface Tutorial {
  proposed: boolean;
  isRunning: boolean;
  currentStep: number;
  currentText: string;
}

interface DropArea {
  height: number | string;
  width: number | string;
  left: number | string;
  top: number | string;
  display: boolean;
}

interface TrackingParams {
  allowed: boolean;
  levelStartTime: Date | null;
  gameStartTime: Date | null;
}

// Refs
const info = reactive<LevelInfo>({
  level: 1,
  currentExercise: 0,
  totalExercises: 5, // Exercises per level
});

const modalState = ref<ModalState>(ModalState.default);

const success = ref<boolean | null>(null);
const showFeedback = ref(false);
const feedbackIsCorrect = ref(false);
const isRerolling = ref(false);
const showTitleAnimation = ref(false);
const showNotification = ref(false);
const gameStarted = ref(false);

const health = reactive<Resource>({
  current: 3,
  max: 3,
});

const rerolls = reactive<Resource>({
  current: 3,
  max: 3,
});

const options = ref<Option[]>([]);
const nodeId = ref(0);
const expression = ref("");
const modalText = ref("Welcome!");
const loot = reactive<Loot>({
  selected: null,
  bagpack: [],
});

const treeData = reactive<TreeData>({
  nodes: [],
  edges: [],
});

const booleanExpr = ref<any>(null);
const texOptions = ref<string[]>([]);
const previousExpression = ref<string>("");

const difficultySettings: Record<number, string[]> = {
  1: [ "and", "or", "not", "True", "False" ],
  2: [ "and", "not", "True", "False", "xor" ],
};

const tutorial = reactive<Tutorial>({
  proposed: localStorage.tutorialProposed === "true" || false,
  isRunning: false,
  currentStep: 0,
  currentText: "",
});

const trackingParams = reactive<TrackingParams>({
  allowed: localStorage.trackingAllowed === "true" || false,
  levelStartTime: null,
  gameStartTime: null,
});

const drop = reactive({
  top: { height: 0, width: 0, left: 0, top: 0, display: false } as DropArea,
  left: { height: 0, width: 0, left: 0, top: 0, display: false } as DropArea,
  right: { height: 0, width: 0, left: 0, top: 0, display: false } as DropArea,
  bottom: { height: 0, width: 0, left: 0, top: 0, display: false } as DropArea,
});

// Template refs
const modal = ref<Modal | null>(null);
const stopwatch = ref<any>(null);
const modalElement = ref<HTMLElement | null>(null);

// Inject API
const $api = inject("$api") as any;
const $log = inject("$log") as any;

const subscripts: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

// Helper function to format labels with subscripts
const formatLabelWithSubscripts = (label: string): string => {
  return label.replace(/(\d)/g, (match) => subscripts[match] || match);
};

const blockBarColors = computed(() => colors.gradient.purple.slice());

const vars = computed(() => {
  return new Array(info.currentExercise + 1).fill(0).map((_, index) => `v${index}`);
});

const functions = computed(() => {
  if (info.level <= 3) {
    return difficultySettings[info.level];
  } else {
    return [ "and", "or", "not", "true", "false", "xor", "implication", "eq" ];
  }
});

const stopwatchTime = computed(() => {
  const minutesPerDifficulty = 0.5;
  const totalSecs = minutesPerDifficulty * 60 * info.level;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs - mins * 60;
  return `${mins}:${secs}`;
});

const isGameInProgress = computed(() => {
  return gameStarted.value && health.current > 0;
});

const steps = [
  {
    selector: ".card.border-dark",
    text: "The goal is to make this evaluate to 'true'.",
  },
  {
    selector: ".tree",
    text: "This visualization can be helpful, too!",
  },
  {
    selector: ".btn.btn-primary.faster, .btn.btn-danger.faster",
    text: "You can configure the variables using these buttons.",
  },
  {
    selector: ".btn.btn-primary.confirm",
    text: "You have to confirm your configuration.",
  },
  {
    selector: ".text-danger",
    text: "You can take damage if your input is wrong!",
  },
  {
    selector: ".btn.btn-warning",
    text: "If you don't like the current expression you can reroll it using these.",
  },
];

const getTutorialElement = (): HTMLElement | null => {
  const step = steps[tutorial.currentStep];
  if (!step) return null;
  return document.querySelector(step.selector) as HTMLElement | null;
};

const tutorialData = computed(() => {
  const step = steps[tutorial.currentStep];
  return (
      step || {
        selector: null,
        text: "That's it! Have fun playing the game!",
      }
  );
});

// Methods
const toggleVariable = (node: string, index: number) => {
  options.value[index].selected = !options.value[index].selected;
};

const rerollExpression = () => {
  if (rerolls.current > 0) {
    isRerolling.value = true;
    if (info.currentExercise === info.totalExercises - 1) {
      stopwatch.value?.stopTimer();
      stopwatch.value?.setupTimer();
    }
    setTimeout(() => {
      generateExercise();
    }, 500);
    rerolls.current--;
  }
};

const takeDamage = () => {
  if (navigator.vibrate) {
    navigator.vibrate(250);
  }
  health.current--;
  if (health.current === 0) {
    gameOver();
  }
};

const confirm = () => {
  const selection: Record<string, boolean> = {};
  options.value.forEach((o) => (selection[o.name] = o.selected));
  const isAnswerCorrect = booleanExpr.value?.evaluate(selection);
  success.value = isAnswerCorrect;

  // Show feedback overlay
  feedbackIsCorrect.value = isAnswerCorrect;
  showFeedback.value = true;

  if (success.value) {
    // Delay to show feedback before moving to next exercise
    setTimeout(() => {
      showFeedback.value = false;
      info.currentExercise++;
      setTimeout(cleanup, 100);
    }, 1000);
  } else {
    // Delay damage indication and generate new question
    setTimeout(() => {
      showFeedback.value = false;
      takeDamage();
      generateExercise();
    }, 1000);
  }

  const ops = booleanExpr.value?.ops();
  $api.saveTrack({
    starTime: trackingParams.levelStartTime,
    data: {
      event: EventType.confirmInput,
      ops: ops,
      success: success.value,
      difficulty: info.level,
      level: info.currentExercise,
      difficultySettings: functions.value,
      variableCount: options.value.length,
    },
  });
};

const hideFeedback = () => {
  showFeedback.value = false;
};

const triggerConfetti = () => {
  const confetti_burst = confetti.create(null, {
    resize: true,
    useWorker: true,
  });

  confetti_burst({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: [ "#2abb79", "#1e8a5c", "#28a745", "#20c997" ],
  });

  setTimeout(
      () =>
          confetti_burst({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: [ "#2abb79", "#1e8a5c", "#28a745" ],
          }),
      150
  );

  setTimeout(
      () =>
          confetti_burst({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: [ "#2abb79", "#1e8a5c", "#28a745" ],
          }),
      300
  );
};

const pickLoot = (lootType: string) => {
  loot.selected = lootType;
};

const emptyBackpack = () => {
  loot.bagpack.forEach((lootItem) => {
    switch (lootItem) {
    case "heart":
      if (health.current < health.max) {
        health.current++;
      }
      break;
    case "dice":
      if (rerolls.current < rerolls.max) {
        rerolls.current++;
      }
      break;
    }
  });
  loot.bagpack = [];
};

const cleanup = () => {
  if (info.currentExercise === info.totalExercises) {
    triggerConfetti();
    setTimeout(() => {
      gameStarted.value = false; // Allow navigation while choosing loot
      modalState.value = ModalState.won;
      modalText.value = "Good Job! Choose your Loot";
      modal.value?.show();
    }, 1500);
  } else {
    generateExercise();
  }
};

const nextLevel = () => {
  $api.saveTrack({
    data: {
      event: EventType.stageCompleted,
      difficulty: info.level,
      difficultySettings: functions.value,
      gameTime: trackingParams.gameStartTime ? new Date().getTime() - trackingParams.gameStartTime.getTime() : 0,
      loot: loot.selected,
    },
  });
  gameStarted.value = true; // Continue game protection
  info.currentExercise = 0;
  info.level++;
  loot.bagpack.push(loot.selected || "");
  loot.selected = null;
  modal.value?.hide();
  generateExercise();
};

const generateExercise = () => {
  nodeId.value = 0;

  let generatedTree;
  let currentExpressionStr = "";
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loop

  // Keep generating until we get a different expression
  do {
    const result = randBoolExpr({
      setSize: 2,
      maxDepth: info.level,
      vars: vars.value,
      expWhiteList: functions.value,
    });
    generatedTree = result.tree;
    currentExpressionStr = generatedTree.to("tex");
    attempts++;
  } while (currentExpressionStr === previousExpression.value && attempts < maxAttempts);

  // Store the new expression for next comparison
  previousExpression.value = currentExpressionStr;
  booleanExpr.value = generatedTree;

  const { nodes, edges, leafs } = booleanExpr.value.toGraph();
  treeData.nodes = nodes;
  treeData.edges = edges;

  if (leafs.length > 0) {
    options.value = leafs
        .map((node: any) => ({
          name: node.v,
          color: node.color,
          selected: false,
        }))
        .sort((a: Option, b: Option) => a.name.localeCompare(b.name));
    texOptions.value = leafs.map((node: any) => node.to("tex")).sort();
  }

  emptyBackpack();

  if (info.currentExercise === info.totalExercises - 1) {
    stopwatch.value?.startTimer();
  }

  // if (tutorial.proposed && info.currentExercise === 0) {
  //   slideInTitle();
  // }

  trackingParams.levelStartTime = new Date();

  if (info.currentExercise === 0 && info.level === 1) {
    trackingParams.gameStartTime = new Date();

    $api.saveTrack({
      data: {
        event: EventType.gameStart,
        startTime: trackingParams.gameStartTime,
        maxLevel: info.totalExercises,
        health: health.max,
        rerolls: rerolls.max,
        difficultySettings: difficultySettings,
      },
    });
  }
};

const slideInTitle = () => {
  showTitleAnimation.value = true;
};

const resetGame = () => {
  gameStarted.value = true;
  modalState.value = ModalState.default;
  modalText.value = "";
  modal.value?.hide();
  info.currentExercise = 0;
  info.level = 1;
  health.current = 3;
  rerolls.current = 3;
  previousExpression.value = ""; // Clear previous expression for new game
  generateExercise();
};

const gameOver = () => {
  gameStarted.value = false;
  modalState.value = ModalState.gameOver;
  modalText.value = "Game Over!";
  modal.value?.show();

  $api.saveTrack({
    data: {
      event: EventType.gameEnd,
      gameTime: trackingParams.gameStartTime ? new Date().getTime() - trackingParams.gameStartTime.getTime() : 0,
      difficulty: info.level,
    },
  });
  addLeaderboardEntry("player1", calculatePoints());
};

const goToHighscores = () => {
  gameStarted.value = false;
  modal.value?.hide();
  router.push("/highscores");
};

const highlightElement = (el: HTMLElement | null) => {
  const size = {
    h: document.documentElement.clientHeight,
    w: document.documentElement.clientWidth,
  };

  drop.top.display = true;
  drop.bottom.display = el !== null;
  drop.right.display = el !== null;
  drop.left.display = el !== null;

  if (el === null) {
    drop.top.height = `${size.h}px`;
    drop.top.width = `${size.w}px`;
    drop.top.left = "0";
    drop.top.top = "0";
  } else {
    const bounds = el.getBoundingClientRect();
    drop.top.height = `${bounds.top}px`;
    drop.top.width = `${bounds.width}px`;
    drop.top.left = `${bounds.left}px`;
    drop.top.top = "0";
    drop.bottom.height = `${size.h - bounds.bottom}px`;
    drop.bottom.width = `${bounds.width}px`;
    drop.bottom.left = `${bounds.left}px`;
    drop.bottom.top = `${bounds.bottom}px`;
    drop.left.left = "0";
    drop.left.top = "0";
    drop.left.height = `${size.h}px`;
    drop.left.width = `${bounds.left}px`;
    drop.right.top = "0";
    drop.right.left = `${bounds.left + bounds.width}px`;
    drop.right.width = `${size.w - (bounds.left + bounds.width)}px`;
    drop.right.height = `${size.h}px`;
  }
};

const skipTutorial = () => {
  localStorage.tutorialProposed = "true";
  modal.value?.hide();
  showGameStartModal();
};

const startTutorial = () => {
  localStorage.tutorialProposed = "true";
  tutorial.isRunning = true;
  modal.value?.hide();
  showNotification.value = true;
  progressTutorial();
};

const showGameStartModal = () => {
  modalState.value = ModalState.ready;
  modalText.value = "Ready to Play?";
  modal.value?.show();
};

const startGame = () => {
  gameStarted.value = true;
  modal.value?.hide();
  previousExpression.value = ""; // Clear previous expression for the new game
  generateExercise();
  slideInTitle();
};

const progressTutorial = () => {
  if (tutorial.currentStep <= steps.length) {
    tutorial.currentText = tutorialData.value.text;
    const element = getTutorialElement();
    highlightElement(element);
  } else {
    stopTutorial();
  }
  tutorial.currentStep++;
};

const stopTutorial = () => {
  tutorial.isRunning = false;
  showNotification.value = false;
  drop.top.display = false;
  drop.bottom.display = false;
  drop.left.display = false;
  drop.right.display = false;
  showGameStartModal();
};

const addLeaderboardEntry = (name: string, points: number) => {
  try {
    $api.saveGameScore(name, points, info.level);
  } catch (error) {
    console.warn("Failed to save game score:", error);
  }
};

const calculatePoints = (): number => {
  const points = (info.level - 1) * 5 + info.currentExercise;
  $log(`Points: ${points}`);
  return points;
};

// Watchers
watch(
    () => booleanExpr.value,
    (node) => {
      if (node && typeof node.to === "function") {
        expression.value = (nodeId.value === 0 ? "\\phi = " : "") + node.to("tex", { color: true });
      }
    }
);

watch(
    () => showTitleAnimation.value,
    (newVal) => {
      if (newVal) {
        // Animation will complete in 1.5s, then reset
        setTimeout(() => {
          showTitleAnimation.value = false;
        }, 1500);
      }
    }
);

watch(
    () => isRerolling.value,
    (newVal) => {
      if (newVal) {
        // Animation will complete in 1s, then reset
        setTimeout(() => {
          isRerolling.value = false;
          success.value = false;
        }, 1000);
      }
    }
);

// Prevent page reload/close during the active game
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (isGameInProgress.value) {
    event.preventDefault();
    return "";
  }
};

// Lifecycle
onMounted(() => {
  // Initialize Bootstrap modal
  if (modalElement.value) {
    modal.value = new Modal(modalElement.value, {
      backdrop: "static",
      keyboard: false,
    });
  }

  // Add beforeunload listener
  window.addEventListener("beforeunload", handleBeforeUnload);

  // if (!tutorial.proposed) {
  //   // First time user - show welcome/tutorial modal
  //   modalState.value = ModalState.tutorial;
  //   modalText.value = "Welcome!";
  //   modal.value?.show();
  // } else {
  //   // Returning user - show game start confirmation
  //   showGameStartModal();
  // }
  showGameStartModal();
});

onBeforeUnmount(() => {
  // Remove beforeunload listener
  window.removeEventListener("beforeunload", handleBeforeUnload);

  // Hide modal when leaving the route
  if (modal.value) {
    modal.value.hide();
  }
});

// Prevent navigation away during the active game
onBeforeRouteLeave((to, from, next) => {
  if (isGameInProgress.value) {
    const confirmed = window.confirm("You have a game in progress. Are you sure you want to leave?");
    if (confirmed) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});
</script>

<style>
/* Main Layout - Flexbox approach */
.game-wrapper {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 66px); /* Subtract navbar height */
  max-height: calc(100vh - 66px);
  padding: 0.5rem 0.5rem 1rem 0.5rem; /* Extra padding at bottom */
  gap: 0.5rem;
  overflow: hidden;
}

/* Adjust for larger navbar on desktop */
@media (min-width: 768px) {
  .game-wrapper {
    min-height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
  }
}

.game-header {
  flex: 0 0 auto; /* Don't grow, don't shrink, auto size */
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.game-middle {
  flex: 1 1 0; /* Grow to fill available space */
  min-height: 0; /* Important: allows flex item to shrink below content size */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-footer {
  flex: 0 0 auto; /* Don't grow, don't shrink, auto size */
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.game-footer .btn {
  padding: 0.75rem 1.25rem;
}

/* Card styling */
.card {
  margin: 0;
}

.card-body {
  padding: 0.75rem 1rem;
}

.card-header {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

/* Block bar */
.game-header .flex-grow-1 {
  height: 2rem;
}

/* Typography */
.tex {
  font-size: 1.5em;
}

/* Responsive adjustments */
@media (max-height: 700px) {
  .game-wrapper {
    padding: 0.25rem;
    gap: 0.25rem;
  }

  .game-header {
    gap: 0.25rem;
  }

  .card-body {
    padding: 0.5rem;
  }

  .card-header {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }

  .tex {
    font-size: 1em;
  }

  .game-header .flex-grow-1 {
    height: 1.25rem;
  }
}

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

.loot-unselected {
  color: #6c757d;
  transition: all 0.3s ease;
  cursor: pointer;
}

.loot-unselected:hover {
  color: #495057;
  transform: scale(1.1);
}

.dice-selected {
  color: goldenrod;
  transition: all 0.3s ease;
  cursor: pointer;
  text-shadow: 0 0 15px rgba(218, 165, 32, 0.8);
  transform: scale(1.15);
}

.dice-selected:hover {
  text-shadow: 0 0 25px rgba(218, 165, 32, 1);
  transform: scale(1.25);
}

.heart-selected {
  color: darkred;
  transition: all 0.3s ease;
  cursor: pointer;
  text-shadow: 0 0 15px rgba(139, 0, 0, 0.8);
  transform: scale(1.15);
}

.heart-selected:hover {
  text-shadow: 0 0 25px rgba(139, 0, 0, 1);
  transform: scale(1.25);
}

.loot-item-wrapper {
  padding: 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.loot-item-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.loot-label {
  margin-top: 1rem;
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.trophy-icon {
  color: #ffc107;
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
}

/* Button sizing */
.btn {
  padding: 0.5rem 1rem;
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
