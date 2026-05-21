export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export const SCORE_PER_FOOD = 10;
export const BASE_INTERVAL = 150;
export const MIN_INTERVAL = 60;
export const SPEED_STEP = 5;
export const SPEED_STEP_SCORE = 50;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function createGame() {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    state: 'start',
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: null,
    score: 0,
    foodPulse: 0,
    tickInterval: BASE_INTERVAL,
    lastTick: 0,
  };
}

export function resetGame(game) {
  const fresh = createGame();
  Object.assign(game, fresh);
  spawnFood(game);
}

export function startGame(game) {
  game.state = 'playing';
  game.lastTick = 0;
  if (!game.food) spawnFood(game);
}

export function setDirection(game, dir) {
  if (game.state !== 'playing') return;
  if (OPPOSITE[dir] === game.direction) return;
  game.nextDirection = dir;
}

export function getTickInterval(score) {
  const steps = Math.floor(score / SPEED_STEP_SCORE);
  return Math.max(MIN_INTERVAL, BASE_INTERVAL - steps * SPEED_STEP);
}

function wrapCoord(value) {
  return ((value % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
}

function spawnFood(game) {
  const occupied = new Set(game.snake.map((s) => `${s.x},${s.y}`));
  const empty = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) {
    game.food = null;
    return;
  }
  game.food = empty[Math.floor(Math.random() * empty.length)];
  game.foodPulse = 1;
}

export function tick(game) {
  if (game.state !== 'playing') return null;

  game.direction = game.nextDirection;
  const dir = DIRECTIONS[game.direction];
  const head = game.snake[0];
  const newHead = {
    x: wrapCoord(head.x + dir.x),
    y: wrapCoord(head.y + dir.y),
  };

  const ateFood =
    game.food &&
    newHead.x === game.food.x &&
    newHead.y === game.food.y;

  const bodyToCheck = ateFood ? game.snake : game.snake.slice(0, -1);
  if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    game.state = 'gameover';
    return { event: 'gameover' };
  }

  game.snake.unshift(newHead);

  if (ateFood) {
    game.score += SCORE_PER_FOOD;
    game.tickInterval = getTickInterval(game.score);
    spawnFood(game);
    return { event: 'eat' };
  }

  game.snake.pop();
  return { event: 'move' };
}

export function updateAnimations(game, delta) {
  if (game.foodPulse > 0) {
    game.foodPulse = Math.max(0, game.foodPulse - delta * 0.003);
  }
}
