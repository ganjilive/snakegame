import { GRID_SIZE, DIRECTIONS } from './game.js';

const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIR_NAMES = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function wrapCoord(value) {
  return ((value % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
}

function headFor(snake, direction) {
  const h = snake[0];
  const d = DIRECTIONS[direction];
  return { x: wrapCoord(h.x + d.x), y: wrapCoord(h.y + d.y) };
}

function manhattan(a, b) {
  const dx = Math.min(Math.abs(a.x - b.x), GRID_SIZE - Math.abs(a.x - b.x));
  const dy = Math.min(Math.abs(a.y - b.y), GRID_SIZE - Math.abs(a.y - b.y));
  return dx + dy;
}

function getOccupiedCells(game, excludeEvilId = null) {
  const occupied = new Set();
  game.snake.forEach((s) => occupied.add(`${s.x},${s.y}`));
  game.evilSnakes.forEach((evil) => {
    if (!evil.alive || evil.id === excludeEvilId) return;
    evil.snake.forEach((s) => occupied.add(`${s.x},${s.y}`));
  });
  return occupied;
}

function isSelfCollision(snake, newHead, willGrow) {
  const body = willGrow ? snake : snake.slice(0, -1);
  return body.some((s) => s.x === newHead.x && s.y === newHead.y);
}

function getSafeDirections(evil, game) {
  const safe = [];
  for (const dir of DIR_NAMES) {
    if (OPPOSITE[dir] === evil.direction) continue;
    const newHead = headFor(evil.snake, dir);
    if (!isSelfCollision(evil.snake, newHead, false)) {
      safe.push(dir);
    }
  }
  return safe.length ? safe : [evil.direction];
}

function bfsNextDirection(start, target, game, excludeEvilId) {
  const occupied = getOccupiedCells(game, excludeEvilId);
  const startKey = `${start.x},${start.y}`;
  const targetKey = `${target.x},${target.y}`;
  const queue = [{ x: start.x, y: start.y, path: [] }];
  const visited = new Set([startKey]);

  while (queue.length > 0) {
    const node = queue.shift();
    const key = `${node.x},${node.y}`;
    if (key === targetKey && node.path.length > 0) {
      return node.path[0];
    }
    if (node.path.length >= 24) continue;

    for (const dir of DIR_NAMES) {
      const d = DIRECTIONS[dir];
      const nx = wrapCoord(node.x + d.x);
      const ny = wrapCoord(node.y + d.y);
      const nKey = `${nx},${ny}`;
      if (visited.has(nKey)) continue;
      if (occupied.has(nKey) && nKey !== targetKey) continue;
      visited.add(nKey);
      queue.push({ x: nx, y: ny, path: [...node.path, dir] });
    }
  }
  return null;
}

function scoreDirection(dir, evil, game) {
  const newHead = headFor(evil.snake, dir);
  let score = 0;

  if (game.frog) {
    const dist = manhattan(newHead, game.frog);
    score -= dist * 10;
  }

  const playerHead = game.snake[0];
  if (manhattan(newHead, playerHead) <= 6) {
    score -= manhattan(newHead, playerHead) * 5;
  }

  const playerBody = game.snake.slice(1);
  if (playerBody.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    score -= 100;
  }

  for (const other of game.evilSnakes) {
    if (!other.alive || other.id === evil.id) continue;
    if (other.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      score -= 80;
    }
  }

  return score;
}

export function chooseEvilDirection(evil, game) {
  if (!evil.alive) return evil.direction;

  const safe = getSafeDirections(evil, game);
  const head = evil.snake[0];

  if (game.frog) {
    const pathDir = bfsNextDirection(head, game.frog, game, evil.id);
    if (pathDir && safe.includes(pathDir)) return pathDir;
  }

  const playerHead = game.snake[0];
  if (manhattan(head, playerHead) <= 6) {
    const huntDir = bfsNextDirection(head, playerHead, game, evil.id);
    if (huntDir && safe.includes(huntDir)) return huntDir;
  }

  let best = safe[0];
  let bestScore = -Infinity;
  for (const dir of safe) {
    const s = scoreDirection(dir, evil, game);
    if (s > bestScore) {
      bestScore = s;
      best = dir;
    }
  }
  return best;
}
