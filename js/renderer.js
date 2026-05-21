import { GRID_SIZE, CELL_SIZE, CANVAS_SIZE } from './game.js';

const COLORS = {
  background: '#c8d878',
  grid: 'rgba(42, 42, 42, 0.06)',
  border: '#2a2a2a',
  snakeBody: '#2a2a2a',
  snakeHead: '#1a1a1a',
  snakeEye: '#c8d878',
  frogBody: '#2a5a2a',
  frogEye: '#8fd48f',
  evilHead: '#cc2222',
  evilBody: '#991111',
  evilEye: '#ffcccc',
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

  if (game.frog) drawFrog(ctx, game.frog, game.frogPulse);
  drawSnake(ctx, game.snake, COLORS.snakeHead, COLORS.snakeBody, COLORS.snakeEye);

  game.evilSnakes
    .filter((e) => e.alive)
    .forEach((evil) => {
      drawSnake(ctx, evil.snake, COLORS.evilHead, COLORS.evilBody, COLORS.evilEye);
    });
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

function drawSnake(ctx, snake, headColor, bodyColor, eyeColor) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE;
    const y = segment.y * CELL_SIZE;
    const padding = 1;
    const size = CELL_SIZE - padding * 2;

    if (index === 0) {
      ctx.fillStyle = headColor;
      ctx.fillRect(x + padding, y + padding, size, size);

      const prev = snake[1];
      if (prev) {
        let dx = segment.x - prev.x;
        let dy = segment.y - prev.y;
        if (Math.abs(dx) > 1) dx = dx > 0 ? -1 : 1;
        if (Math.abs(dy) > 1) dy = dy > 0 ? -1 : 1;

        ctx.fillStyle = eyeColor;
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
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + padding, y + padding, size, size);
    }
  });
}

function drawFrog(ctx, frog, pulse) {
  const x = frog.x * CELL_SIZE;
  const y = frog.y * CELL_SIZE;
  const scale = 1 + pulse * 0.15;
  const pad = 2 + (1 - scale) * 2;
  const size = (CELL_SIZE - pad * 2) * scale;
  const ox = x + (CELL_SIZE - size) / 2;
  const oy = y + (CELL_SIZE - size) / 2;

  ctx.fillStyle = COLORS.frogBody;
  ctx.fillRect(ox, oy, size, size);

  ctx.fillStyle = COLORS.frogEye;
  const eye = Math.max(2, size * 0.2);
  ctx.fillRect(ox + size * 0.2, oy + size * 0.25, eye, eye);
  ctx.fillRect(ox + size * 0.6, oy + size * 0.25, eye, eye);
}
