<template>
  <canvas ref="canvas" class="falling-operators-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

interface Operator {
  x: number;
  y: number;
  speed: number;
  char: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  drift: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
  color: string;
}

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;
let operators: Operator[] = [];
let time = 0;

// Logical operator symbols
const operatorChars = ['∧', '∨', '¬', '⊕', '→', '↔', '⊤', '⊥'/*, '≡', '∀', '∃'*/];

// Color palette for operators
const colors = [
  'rgb(42, 187, 121)',   // Theme green
  'rgb(100, 149, 237)',  // Cornflower blue
  'rgb(147, 112, 219)',  // Medium purple
  'rgb(72, 209, 204)',   // Medium turquoise
  'rgb(123, 104, 238)',  // Medium slate blue
  'rgb(135, 206, 235)',  // Sky blue
  'rgb(106, 90, 205)',   // Slate blue
  'rgb(70, 130, 180)',   // Steel blue
];

const createOperator = (canvasWidth: number, canvasHeight: number, startFromTop = false): Operator => {
  return {
    x: Math.random() * canvasWidth,
    y: startFromTop ? -50 : Math.random() * canvasHeight,
    speed: 0.05 + Math.random() * 0.3, // Varying falling speed
    char: operatorChars[Math.floor(Math.random() * operatorChars.length)],
    fontSize: 16 + Math.random() * 24,
    opacity: 0.2 + Math.random() * 0.3, // Subtle opacity
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.03,
    drift: (Math.random() - 0.5) * 0.3, // Horizontal drift
    swayAmplitude: 10 + Math.random() * 20, // How much it sways left/right
    swaySpeed: 0.01 + Math.random() * 0.02, // Speed of swaying
    swayOffset: Math.random() * Math.PI * 2, // Random starting point in sway
    color: colors[Math.floor(Math.random() * colors.length)],
  };
};

const initCanvas = () => {
  if (!canvas.value) return;

  const canvasElement = canvas.value;
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  ctx = canvasElement.getContext('2d');

  // Create initial operators
  const operatorCount = Math.floor((canvasElement.width * canvasElement.height) / 7000);
  operators = [];

  for (let i = 0; i < operatorCount; i++) {
    operators.push(createOperator(canvasElement.width, canvasElement.height, false));
  }
};

const animate = () => {
  if (!canvas.value || !ctx) return;

  const canvasWidth = canvas.value.width;
  const canvasHeight = canvas.value.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Increment time for sway animation
  time += 1;

  // Update and draw each operator
  operators.forEach((operator, index) => {
    // Calculate swaying horizontal movement (like snow drifting)
    const swayX = Math.sin(time * operator.swaySpeed + operator.swayOffset) * operator.swayAmplitude;

    // Update position
    operator.y += operator.speed;
    operator.x += operator.drift; // Gradual horizontal drift
    operator.rotation += operator.rotationSpeed;

    // Reset if operator goes off screen (bottom or sides)
    if (operator.y > canvasHeight + 50 || operator.x < -50 || operator.x > canvasWidth + 50) {
      operators[index] = createOperator(canvasWidth, canvasHeight, true);
    }

    // Draw operator with sway
    if (ctx) {
      ctx.save();
      ctx.translate(operator.x + swayX, operator.y);
      ctx.rotate(operator.rotation);
      ctx.font = `${operator.fontSize}px Arial`;

      // Use the operator's color with its opacity
      const colorMatch = operator.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (colorMatch) {
        const [, r, g, b] = colorMatch;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${operator.opacity})`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(operator.char, 0, 0);
      ctx.restore();
    }
  });

  animationFrameId = requestAnimationFrame(animate);
};

const handleResize = () => {
  initCanvas();
};

onMounted(() => {
  initCanvas();
  animate();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.falling-operators-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
