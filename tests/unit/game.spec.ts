import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * Level-completion flow.
 *
 * This exists because of a real freeze: <Stopwatch> was used in the template under a name
 * the import no longer provided, so it rendered as a bare DOM element. `ref="stopwatch"`
 * then held an Element rather than the component, and `stopwatch.value?.startTimer()` --
 * whose `?.` guards a null ref but not a missing method -- threw while building the final
 * exercise of a level. The player was left stuck on the answer feedback.
 *
 * The generator is mocked so every answer is correct and the run is deterministic.
 */

const modalShow = vi.fn();
const modalHide = vi.fn();

vi.mock('bootstrap', () => ({
  Modal: class {
    show = modalShow;
    hide = modalHide;
  },
}));

vi.mock('canvas-confetti', () => ({
  default: { create: () => vi.fn() },
}));

vi.mock('@/services/soundService.ts', () => ({
  soundService: { play: vi.fn() },
  SoundType: {
    CORRECT: 'correct',
    WRONG: 'wrong',
    PARTY_HORN: 'partyHorn',
    DICE: 'dice',
    CLICK: 'click',
    GAME_OVER: 'gameOver',
  },
}));

vi.mock('@/services/musicService', () => ({
  musicService: {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    isCurrentlyPlaying: () => false,
    isCurrentlyPaused: () => false,
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
}));

let exerciseSerial = 0;
vi.mock('@/lib/compiler/generator', () => ({
  randBoolExpr: () => {
    exerciseSerial++;
    const leaf = {
      v: 'v0',
      color: '#000000',
      to: () => `v0#${exerciseSerial}`,
    };
    return {
      tree: {
        // Every submitted answer counts as correct, so a run is five clicks.
        evaluate: () => true,
        // Must differ each time: generateExercise re-rolls while the rendered expression
        // matches the previous one.
        to: () => `expression#${exerciseSerial}`,
        toGraph: () => ({ nodes: [], edges: [], leafs: [leaf] }),
        ops: () => [],
      },
    };
  },
}));

import Game from '@/views/Game.vue';

const mountGame = () =>
  mount(Game, {
    global: {
      provide: {
        $api: { saveTrack: vi.fn(), saveGameScore: vi.fn() },
        $log: vi.fn(),
      },
      stubs: {
        // Rendered by dagre against a real SVG canvas; irrelevant to the flow.
        Tree: true,
        FallingOperators: true,
        'font-awesome-icon': true,
      },
    },
  });

/** Answers the current exercise and lets the feedback + cleanup timers run out. */
async function answerOnce(wrapper: ReturnType<typeof mountGame>) {
  await wrapper.find('button.btn-success').trigger('click');
  // confirm() holds the feedback for 1s, then runs cleanup 100ms later; completing a
  // level waits a further 1.5s before opening the loot modal.
  await vi.advanceTimersByTimeAsync(3000);
  await flushPromises();
}

describe('Game level completion', () => {
  beforeEach(() => {
    exerciseSerial = 0;
    modalShow.mockClear();
    modalHide.mockClear();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts the game immediately, with no start screen to dismiss', async () => {
    const wrapper = mountGame();
    await flushPromises();

    expect(wrapper.find('button.btn-success').exists()).toBe(true);
    expect(wrapper.text()).toContain('Make this formula true');
  });

  it('reaches the final exercise without throwing', async () => {
    const wrapper = mountGame();
    await flushPromises();

    // The fifth exercise is the one that starts the countdown, and so the one that used
    // to throw while being generated.
    for (let i = 0; i < 4; i++) {
      await answerOnce(wrapper);
    }

    expect(wrapper.text()).toContain('Make this formula true');
    expect(wrapper.find('button.btn-success').exists()).toBe(true);
  });

  it('opens the loot modal after the fifth correct answer', async () => {
    const wrapper = mountGame();
    await flushPromises();

    for (let i = 0; i < 5; i++) {
      await answerOnce(wrapper);
    }

    expect(modalShow).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Choose your Loot');
  });

  it('hides the answer feedback once a level is complete', async () => {
    const wrapper = mountGame();
    await flushPromises();

    for (let i = 0; i < 5; i++) {
      await answerOnce(wrapper);
    }

    // The freeze showed up as the CORRECT! overlay never going away.
    expect(wrapper.text()).not.toContain('CORRECT!');
  });
});
