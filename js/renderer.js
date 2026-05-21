import { GRID_SIZE, CELL_SIZE, CANVAS_SIZE } from './game.js';

const COLORS = {
  background: '#c8d878',
  grid: 'rgba(42, 42, 42, 0.06)',
  border: '#2a2a2a',
  snakeBody: '#2a2a2a',
  snakeHead: '#1a1a1a',
  snakeEye: '#c8d878',
  food: '#2a2a2a',
};

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

export function render(renderer, game) {
  const { ctx } = renderer;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  drawGrid(ctx);
  drawBorder(ctx);

  if (game.food) drawFood(ctx, game.food, game.foodPulse);
  drawSnake(ctx, game.snake);

  if (game.state === 'playing' || game.state === 'gameover') {
    // game canvas only; HUD is HTML
  }
}

function drawGrid(ctx) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(CANVAS_SIZE, pos);
    ctx.stroke();
  }
}

function drawBorder(ctx) {
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, CANVAS_SIZE - 3, CANVAS_SIZE - 3);
}

function drawSnake(ctx, snake) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE;
    const y = segment.y * CELL_SIZE;
    const padding = 1;
    const size = CELL_SIZE - padding * 2;

    if (index === 0) {
      ctx.fillStyle = COLORS.snakeHead;
      ctx.fillRect(x + padding, y + padding, size, size);

      const prev = snake[1];
      if (prev) {
        const dx = segment.x - prev.x;
        const dy = segment.y - prev.y;
        ctx.fillStyle = COLORS.snakeEye;
        const eyeSize = 3;
        const eyeOffset = 5;

        if (dx !== 0) {
          const ex = dx > 0 ? x + CELL_SIZE - eyeOffset - eyeSize : x + eyeOffset;
          ctx.fillRect(ex, y + 5, eyeSize, eyeSize);
          ctx.fillRect(ex, y + CELL_SIZE - 8, eyeSize, eyeSize);
        } else {
          const ey = dy > 0 ? y + CELL_SIZE - eyeOffset - eyeSize : y + eyeOffset;
          ctx.fillRect(x + 5, ey, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - 8, ey, eyeSize, eyeSize);
        }
      }
    } else {
      ctx.fillStyle = COLORS.snakeBody;
      ctx.fillRect(x + padding, y + padding, size, size);
    }
  });
}

function drawFood(ctx, food, pulse) {
  const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
  const scale = 1 + pulse * 0.3;
  const half = (CELL_SIZE / 2 - 2) * scale;

  ctx.fillStyle = COLORS.food;
  ctx.beginPath();
  ctx.moveTo(cx, cy - half);
  ctx.lineTo(cx + half, cy);
  ctx.lineTo(cx, cy + half);
  ctx.lineTo(cx - half, cy);
  ctx.closePath();
  ctx.fill();

  const dotSize = 2 * scale;
  ctx.fillRect(cx - dotSize / 2, cy - dotSize / 2, dotSize, dotSize);
  ctx.fillRect(cx - dotSize / 2, cy - half + 1, dotSize, dotSize);
  ctx.fillRect(cx - dotSize / 2, cy + half - dotSize - 1, dotSize, dotSize);
  ctx.fillRect(cx - half + 1, cy - dotSize / 2, dotSize, dotSize);
  ctx.fillRect(cx + half - dotSize - 1, cy - dotSize / 2, dotSize, dotSize);
}
