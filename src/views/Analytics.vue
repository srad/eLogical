<template>
  <div class="container py-4">
    <!-- Stats Cards -->
    <div class="d-flex flex-wrap gap-4 mb-4">
      <div class="flex-fill" style="min-width: 280px">
        <analytics-card title="Runs started" :loading="loading">
          <h3 class="display-4 text-primary mb-0">{{ runsStarted }}</h3>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 280px">
        <analytics-card title="Average level reached" :loading="loading">
          <h3 class="display-4 text-primary mb-0">{{ avgLevel.toFixed(1) }}</h3>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 280px">
        <analytics-card title="Success rate" :loading="loading">
          <h3 class="display-4 text-primary mb-0">{{ successRate.toFixed(1) }}%</h3>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 280px">
        <analytics-card title="Total time played" :loading="loading">
          <h3 class="display-4 text-primary mb-0">{{ totalTimePlayed.toFixed(0) }}m</h3>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 280px">
        <analytics-card title="Levels completed" :loading="loading">
          <h3 class="display-4 text-primary mb-0">{{ levelsCompleted }}</h3>
        </analytics-card>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="d-flex flex-wrap gap-4 mb-4">
      <div class="flex-fill" style="min-width: 0; flex-basis: 400px">
        <analytics-card title="Game Over by difficulty" :loading="loading">
          <bar-chart
            :chart-data="charts.difficultyComparison.data"
            :options="charts.difficultyComparison.options"
          ></bar-chart>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 0; flex-basis: 400px">
        <analytics-card title="Games played by date" :loading="loading">
          <line-chart
            :chart-data="charts.gamesByDate.data"
            :options="charts.gamesByDate.options"
          ></line-chart>
        </analytics-card>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="d-flex flex-wrap gap-4 mb-4">
      <div class="flex-fill" style="min-width: 0; flex-basis: 400px">
        <analytics-card title="Answers submitted" :loading="loading">
          <doughnut-chart
            :chart-data="charts.answersSubmitted.data"
            :options="charts.answersSubmitted.options"
          ></doughnut-chart>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 0; flex-basis: 400px">
        <analytics-card title="Correctness by operator" :loading="loading">
          <bar-chart
            :chart-data="charts.mistakesByOperator.data"
            :options="charts.mistakesByOperator.options"
          ></bar-chart>
        </analytics-card>
      </div>
      <div class="flex-fill" style="min-width: 0; flex-basis: 400px">
        <analytics-card title="Rewards selected" :loading="loading">
          <doughnut-chart
            :chart-data="charts.rewardsSelected.data"
            :options="charts.rewardsSelected.options"
          ></doughnut-chart>
        </analytics-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AnalyticsCard from '../components/AnalyticsCard.vue';
import BarChart from '../lib/charts/BarChart.vue';
import DoughnutChart from '../lib/charts/DoughnutChart.vue';
import LineChart from '../lib/charts/LineChart.vue';
import { useApi } from '@/composables/useApi';

// Types
interface ChartDataset {
  label?: string;
  backgroundColor?: string | string[];
  borderColor?: string;
  data: number[];
}

interface ChartOptions {
  scales?: {
    yAxes: Array<{
      ticks: {
        beginAtZero: boolean;
      };
    }>;
  };
}

interface ChartConfig {
  data: {
    labels: (string | number)[];
    datasets: ChartDataset[];
  };
  options: ChartOptions;
}

interface ChartsState {
  answersSubmitted: ChartConfig;
  difficultyComparison: ChartConfig;
  gamesByDate: ChartConfig;
  mistakesByOperator: ChartConfig;
  rewardsSelected: ChartConfig;
}

interface RunsByDate {
  _id: {
    day: string;
    event?: string;
  };
  frequency: number;
}

// Reactive state
const loading = ref(true);
const runsStarted = ref(0);
const avgLevel = ref(0);
const successRate = ref(0);
const totalTimePlayed = ref(0);
const levelsCompleted = ref(0);

const charts = reactive<ChartsState>({
  answersSubmitted: {
    data: {
      labels: ['Correct', 'Wrong'],
      datasets: [
        {
          backgroundColor: ['rgb(77, 186, 135)', 'rgb(255, 99, 132)'],
          data: [0, 0],
        },
      ],
    },
    options: {},
  },
  difficultyComparison: {
    data: {
      labels: [],
      datasets: [
        {
          label: 'Game Overs',
          data: [],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  },
  gamesByDate: {
    data: {
      labels: [],
      datasets: [
        {
          label: 'Number of games played',
          borderColor: 'rgb(77, 186, 135)',
          data: [],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  },
  mistakesByOperator: {
    data: {
      labels: ['AND', 'OR', 'IMPLICATION', 'NOT', 'XOR', 'EQUAL'],
      datasets: [
        {
          label: 'answered correctly',
          backgroundColor: 'rgb(77, 186, 135)',
          data: [0, 0, 0, 0, 0, 0],
        },
        {
          label: 'answered wrong',
          backgroundColor: 'rgb(255, 99, 132)',
          data: [0, 0, 0, 0, 0, 0],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  },
  rewardsSelected: {
    data: {
      labels: ['life', 'reroll', 'none'],
      datasets: [
        {
          backgroundColor: ['rgb(77, 186, 135)', 'rgb(255, 99, 132)', 'rgb(60, 60, 60)'],
          data: [0, 0, 0],
        },
      ],
    },
    options: {},
  },
});

// Helper functions
function sortRunsByDate(finishedRunsByDate: RunsByDate[]): RunsByDate[] {
  return [...finishedRunsByDate].sort((a, b) => {
    const dateA = a._id.day.toLowerCase();
    const dateB = b._id.day.toLowerCase();
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });
}

function getDates(startDate: Date, stopDate: Date): string[] {
  const dateArray: string[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= stopDate) {
    dateArray.push(formateDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
}

function formateDate(date: Date): string {
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return [
    date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
  ].join('-');
}

function genereateEmptyDayData(unsorted: RunsByDate[]): RunsByDate[] {
  const sorted = sortRunsByDate(unsorted);
  if (sorted.length === 0) return sorted;

  const min = sorted[0]._id.day;
  const max = sorted[sorted.length - 1]._id.day;
  const minDate = new Date(min);
  const maxDate = new Date(max);

  const dateRange = getDates(minDate, maxDate);
  const newDates = dateRange.filter((e) => !sorted.some((x) => x._id.day === e));
  newDates.forEach((date) => {
    sorted.push({ _id: { day: date, event: 'game-end' }, frequency: 0 });
  });

  return sortRunsByDate(sorted);
}

// Main load function
async function loadAnalytics() {
  try {
    const $api = useApi();
    if (!$api) {
      throw new Error('API not available');
    }

    const response = await $api.getAnalytics();
    const analytics = response.data;
    const trackingEvents = await $api.getAllTrackingEvents();

    // Calculate basic metrics
    runsStarted.value = analytics.groupByEvents[1].frequency;
    levelsCompleted.value = analytics.groupBySuccess[1].frequency;

    // Calculate success rate
    const successCount = analytics.groupBySuccess[1]?.frequency ?? 0;
    const failureCount = analytics.groupBySuccess[0]?.frequency ?? 0;
    const totalAnswers = successCount + failureCount;
    successRate.value = totalAnswers > 0 ? (successCount / totalAnswers) * 100 : 0;

    // Populate answers submitted chart
    charts.answersSubmitted.data.datasets[0].data = [successCount, failureCount];

    // Calculate average level and total time from tracking events
    if (trackingEvents && trackingEvents.length > 0) {
      // Filter for confirm-input events which have level information
      const answerEvents = trackingEvents.filter((e) =>
        e.event === 'confirm-input' && e.data?.level !== undefined
      );

      if (answerEvents.length > 0) {
        const totalLevels = answerEvents.reduce((sum, e) =>
          sum + ((e.data?.level as number) ?? 0), 0
        );
        avgLevel.value = totalLevels / answerEvents.length;
      }

      // Calculate total time from levelTime in tracking events
      const totalTime = trackingEvents.reduce((sum, e) => {
        const levelTime = (e.data?.levelTime as number) ?? 0;
        return sum + levelTime;
      }, 0);
      totalTimePlayed.value = totalTime / 1000 / 60; // Convert to minutes
    }

    // Process rewards
    const rewardsSelected: Record<string, number> = {};
    analytics.groupByLootSelected.forEach((el) => {
      if (el._id.loot === null) {
        rewardsSelected.none = el.frequency;
      } else {
        rewardsSelected[el._id.loot] = el.frequency;
      }
    });
    rewardsSelected.heart = rewardsSelected.heart ?? 0;
    rewardsSelected.none = rewardsSelected.none ?? 0;
    rewardsSelected.dice = rewardsSelected.dice ?? 0;

    charts.rewardsSelected.data.datasets[0].data = [
      rewardsSelected.heart,
      rewardsSelected.dice,
      rewardsSelected.none,
    ];

    // Process difficulty data
    const deathsByDifficulty = analytics.groupByGameEndAndDifficulty.map((el) => ({
      difficulty: el._id.difficulty,
      frequency: el.frequency,
    }));
    deathsByDifficulty.sort((a, b) => a.difficulty - b.difficulty);

    charts.difficultyComparison.data.labels = deathsByDifficulty.map((el) => el.difficulty);
    charts.difficultyComparison.data.datasets[0].data = deathsByDifficulty.map((el) => el.frequency);

    // Process operator correctness
    const correctCount: Record<string, number> = {
      and: 0,
      or: 0,
      not: 0,
      xor: 0,
      implication: 0,
      eq: 0,
    };
    const mistakeCount: Record<string, number> = {
      and: 0,
      or: 0,
      not: 0,
      xor: 0,
      implication: 0,
      eq: 0,
    };

    const correctByOperator = analytics.groupBySuccessAndOperator.filter(
      (el) => el._id.success === true
    );
    correctByOperator.forEach((el) =>
      el._id.op.forEach((op) => {
        correctCount[op] = (correctCount[op] ?? 0) + el.frequency;
      })
    );

    const mistakesByOperator = analytics.groupBySuccessAndOperator.filter(
      (el) => el._id.success === false
    );
    mistakesByOperator.forEach((el) =>
      el._id.op.forEach((op) => {
        mistakeCount[op] = (mistakeCount[op] ?? 0) + el.frequency;
      })
    );

    charts.mistakesByOperator.data.datasets[0].data = [
      correctCount.and,
      correctCount.or,
      correctCount.implication,
      correctCount.not,
      correctCount.xor,
      correctCount.eq,
    ];

    charts.mistakesByOperator.data.datasets[1].data = [
      mistakeCount.and,
      mistakeCount.or,
      mistakeCount.implication,
      mistakeCount.not,
      mistakeCount.xor,
      mistakeCount.eq,
    ];

    // Process games by date (using localStorage events if available)
    // For now, we'll handle the case where groupEventsByDay might not exist
    let finishedRunsByDate: RunsByDate[] = [];
    if (analytics.groupEventsByDay) {
      finishedRunsByDate = analytics.groupEventsByDay.filter((x) => x._id.event === 'game-end');
    }

    if (finishedRunsByDate.length > 0) {
      finishedRunsByDate = genereateEmptyDayData(finishedRunsByDate);
      charts.gamesByDate.data.labels = finishedRunsByDate.map((x) => x._id.day);
      charts.gamesByDate.data.datasets[0].data = finishedRunsByDate.map((x) => x.frequency);
    }

    loading.value = false;
  } catch (error) {
    console.error('Failed to load analytics:', error);
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loadAnalytics();
});
</script>
