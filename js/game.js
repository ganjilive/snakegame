import { chooseEvilDirection } from './evil-ai.js';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export const FROG_SCORE = 10;
export const SCORE_PER_FOOD = FROG_SCORE;
export const BASE_INTERVAL = 150;
export const MIN_INTERVAL = 60;
export const SPEED_STEP = 5;
export const SPEED_STEP_SCORE = 50;

export const EVIL_SPLIT_LENGTH = 10;
export const EVIL_START_LENGTH = 3;
export const MAX_EVIL_SNAKES = 4;

export const MAX_LIVES = 3;
export const INVULNERABLE_TICKS = 4;
export const HEART_SPAWN_INTERVAL = 120;
export const HEART_SPAWN_CHANCE = 0.25;
export const MUSHROOM_SPAWN_INTERVAL = 100;
export const MAX_MUSHROOMS = 2;
export const BOMB_SPAWN_INTERVAL = 150;
export const BOMB_SPAWN_CHANCE = 0.2;
export const BOMB_LIFETIME_TICKS = 30;

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

let nextEvilId = 1;

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
    frog: null,
    heart: null,
    bomb: null,
    mushrooms: [],
    score: 0,
    lives: MAX_LIVES,
    frogPulse: 0,
    heartPulse: 0,
    bombPulse: 0,
    heartSpawnTimer: HEART_SPAWN_INTERVAL,
    bombSpawnTimer: BOMB_SPAWN_INTERVAL,
    mushroomSpawnTimer: MUSHROOM_SPAWN_INTERVAL,
    invulnerableTicks: 0,
    tickInterval: BASE_INTERVAL,
    lastTick: 0,
    evilSnakes: [],
  };
}

export function resetGame(game) {
  nextEvilId = 1;
  const fresh = createGame();
  Object.assign(game, fresh);
  spawnFrog(game);
  game.evilSnakes = [createEvilSnake(game)];
}

export function startGame(game) {
  game.state = 'playing';
  game.lastTick = 0;
  if (!game.frog) spawnFrog(game);
  if (game.evilSnakes.length === 0) {
    game.evilSnakes = [createEvilSnake(game)];
  }
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

function getAllOccupied(game, excludeEvilId = null) {
  const occupied = new Set();
  game.snake.forEach((s) => occupied.add(`${s.x},${s.y}`));
  game.evilSnakes.forEach((evil) => {
    if (!evil.alive || evil.id === excludeEvilId) return;
    evil.snake.forEach((s) => occupied.add(`${s.x},${s.y}`));
  });
  if (game.frog) occupied.add(`${game.frog.x},${game.frog.y}`);
  if (game.heart) occupied.add(`${game.heart.x},${game.heart.y}`);
  if (game.bomb) occupied.add(`${game.bomb.x},${game.bomb.y}`);
  game.mushrooms.forEach((m) => occupied.add(`${m.x},${m.y}`));
  return occupied;
}

function getEmptyCells(game, excludeEvilId = null) {
  const occupied = getAllOccupied(game, excludeEvilId);
  const empty = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  return empty;
}

function buildSnakeAt(head, direction, length) {
  const d = DIRECTIONS[direction];
  const snake = [];
  for (let i = 0; i < length; i++) {
    snake.push({
      x: wrapCoord(head.x - d.x * i),
      y: wrapCoord(head.y - d.y * i),
    });
  }
  return snake;
}

function respawnPlayer(game) {
  const center = Math.floor(GRID_SIZE / 2);
  game.snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
  game.direction = 'RIGHT';
  game.nextDirection = 'RIGHT';
  game.invulnerableTicks = INVULNERABLE_TICKS;
}

export function createEvilSnake(game) {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  for (let attempt = 0; attempt < 50; attempt++) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const empty = getEmptyCells(game);
    if (empty.length === 0) break;
    const head = empty[Math.floor(Math.random() * empty.length)];
    const snake = buildSnakeAt(head, direction, EVIL_START_LENGTH);
    const occupied = getAllOccupied(game);
    if (snake.every((s) => !occupied.has(`${s.x},${s.y}`))) {
      return {
        id: nextEvilId++,
        snake,
        direction,
        nextDirection: direction,
        alive: true,
      };
    }
  }
  return { id: nextEvilId++, snake: [], direction: 'UP', nextDirection: 'UP', alive: false };
}

function respawnEvil(game) {
  const evil = createEvilSnake(game);
  if (evil.alive) {
    game.evilSnakes.push(evil);
  }
}

function spawnFrog(game) {
  const empty = getEmptyCells(game);
  if (empty.length === 0) {
    game.frog = null;
    return;
  }
  game.frog = empty[Math.floor(Math.random() * empty.length)];
  game.frogPulse = 1;
}

function spawnHeart(game) {
  if (game.lives >= MAX_LIVES || game.heart) return;
  const empty = getEmptyCells(game);
  if (empty.length === 0) return;
  game.heart = empty[Math.floor(Math.random() * empty.length)];
  game.heartPulse = 1;
}

function trySpawnHeart(game) {
  if (game.lives >= MAX_LIVES || game.heart) return;
  game.heartSpawnTimer -= 1;
  if (game.heartSpawnTimer <= 0) {
    game.heartSpawnTimer = HEART_SPAWN_INTERVAL;
    if (Math.random() < HEART_SPAWN_CHANCE) {
      spawnHeart(game);
    }
  }
}

function updateMushrooms(game) {
  game.mushrooms = game.mushrooms
    .map((m) => ({ x: m.x, y: m.y + 1 }))
    .filter((m) => m.y < GRID_SIZE);
}

function trySpawnMushroom(game) {
  game.mushroomSpawnTimer -= 1;
  if (game.mushroomSpawnTimer <= 0) {
    game.mushroomSpawnTimer = MUSHROOM_SPAWN_INTERVAL;
    if (game.mushrooms.length < MAX_MUSHROOMS) {
      game.mushrooms.push({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: 0,
      });
    }
  }
}

function spawnBomb(game) {
  if (game.bomb) return;
  const empty = getEmptyCells(game);
  if (empty.length === 0) return;
  const cell = empty[Math.floor(Math.random() * empty.length)];
  game.bomb = { x: cell.x, y: cell.y, ticksRemaining: BOMB_LIFETIME_TICKS };
  game.bombPulse = 1;
}

function trySpawnBomb(game) {
  if (game.bomb) return;
  game.bombSpawnTimer -= 1;
  if (game.bombSpawnTimer <= 0) {
    game.bombSpawnTimer = BOMB_SPAWN_INTERVAL;
    if (Math.random() < BOMB_SPAWN_CHANCE) {
      spawnBomb(game);
    }
  }
}

function updateBomb(game) {
  if (!game.bomb) return;
  game.bomb.ticksRemaining -= 1;
  if (game.bomb.ticksRemaining <= 0) {
    game.bomb = null;
  }
}

function computeHead(segment, direction) {
  const d = DIRECTIONS[direction];
  return { x: wrapCoord(segment.x + d.x), y: wrapCoord(segment.y + d.y) };
}

function applyPlayerMove(game, playerHead, ateFrog) {
  game.snake.unshift(playerHead);
  if (ateFrog) {
    game.score += FROG_SCORE;
    game.tickInterval = getTickInterval(game.score);
    spawnFrog(game);
  } else {
    game.snake.pop();
  }
}

function applyEvilMove(evil, newHead, ateFrog) {
  evil.snake.unshift(newHead);
  if (!ateFrog) {
    evil.snake.pop();
  }
}

function splitEvilSnake(game, evil) {
  if (evil.snake.length < EVIL_SPLIT_LENGTH) return;

  const half = Math.floor(evil.snake.length / 2);
  const tailHalf = evil.snake.slice(half);
  evil.snake = evil.snake.slice(0, half);

  const newDir = OPPOSITE[evil.direction];
  const newEvil = {
    id: nextEvilId++,
    snake: [...tailHalf],
    direction: newDir,
    nextDirection: newDir,
    alive: true,
  };

  game.evilSnakes.push(newEvil);

  while (game.evilSnakes.filter((e) => e.alive).length > MAX_EVIL_SNAKES) {
    const oldest = game.evilSnakes.find((e) => e.alive && e.id !== evil.id);
    if (oldest) oldest.alive = false;
    else break;
  }
}

export function tick(game) {
  if (game.state !== 'playing') return null;

  const events = [];
  game.direction = game.nextDirection;

  if (game.invulnerableTicks > 0) {
    game.invulnerableTicks -= 1;
  }

  updateMushrooms(game);
  updateBomb(game);
  trySpawnMushroom(game);
  trySpawnHeart(game);
  trySpawnBomb(game);

  const aliveEvils = game.evilSnakes.filter((e) => e.alive);
  for (const evil of aliveEvils) {
    evil.direction = chooseEvilDirection(evil, game);
    evil.nextDirection = evil.direction;
  }

  const playerHead = computeHead(game.snake[0], game.direction);
  const evilMoves = aliveEvils.map((evil) => ({
    evil,
    head: computeHead(evil.snake[0], evil.direction),
  }));

  let playerAteFrog =
    game.frog &&
    playerHead.x === game.frog.x &&
    playerHead.y === game.frog.y;

  let playerAteHeart =
    game.heart &&
    playerHead.x === game.heart.x &&
    playerHead.y === game.heart.y;

  const mushroomHitIndex = game.mushrooms.findIndex(
    (m) => m.x === playerHead.x && m.y === playerHead.y,
  );

  let playerAteBomb =
    game.bomb &&
    playerHead.x === game.bomb.x &&
    playerHead.y === game.bomb.y;

  const evilAteBombId =
    !playerAteBomb && game.bomb
      ? evilMoves.find(({ head }) => head.x === game.bomb.x && head.y === game.bomb.y)?.evil.id ?? null
      : null;

  const evilAteFrogMap = new Map();
  if (!playerAteFrog && game.frog) {
    for (const { evil, head } of evilMoves) {
      if (head.x === game.frog.x && head.y === game.frog.y) {
        evilAteFrogMap.set(evil.id, true);
        break;
      }
    }
  }

  let playerDead = false;
  let playerShrink = false;
  const evilsToKill = new Set();
  const evilsToRespawn = new Set();
  const evilsKilledByBomb = new Set();
  const invulnerable = game.invulnerableTicks > 0;

  if (mushroomHitIndex >= 0) {
    game.mushrooms.splice(mushroomHitIndex, 1);
    if (game.snake.length <= 1) {
      playerDead = true;
      events.push({ event: 'mushroomHit' });
    } else {
      playerShrink = true;
      events.push({ event: 'mushroomHit' });
    }
  }

  if (!invulnerable) {
    const playerBodyCheck = playerAteFrog ? game.snake : game.snake.slice(0, -1);
    if (playerBodyCheck.some((s) => s.x === playerHead.x && s.y === playerHead.y)) {
      playerDead = true;
    }

    for (const { evil, head } of evilMoves) {
      for (const segment of evil.snake) {
        if (playerHead.x === segment.x && playerHead.y === segment.y) {
          playerDead = true;
        }
      }
    }
  }

  for (let i = 0; i < evilMoves.length; i++) {
    for (let j = i + 1; j < evilMoves.length; j++) {
      const a = evilMoves[i];
      const b = evilMoves[j];
      if (a.head.x === b.head.x && a.head.y === b.head.y) {
        evilsToKill.add(a.evil.id);
        evilsToKill.add(b.evil.id);
      }
    }
  }

  for (const { evil, head } of evilMoves) {
    if (evilsToKill.has(evil.id)) continue;

    if (!invulnerable && head.x === playerHead.x && head.y === playerHead.y) {
      playerDead = true;
      evilsToKill.add(evil.id);
      continue;
    }

    const playerBody = game.snake.slice(1);
    const hitBody = playerBody.some((s) => s.x === head.x && s.y === head.y);
    if (hitBody) {
      evilsToKill.add(evil.id);
      if (game.snake.length <= 1) {
        playerDead = true;
        events.push({ event: 'bothDie' });
      } else {
        playerShrink = true;
        events.push({ event: 'playerShrink' });
      }
    }
  }

  for (const { evil, head } of evilMoves) {
    if (evilsToKill.has(evil.id)) continue;

    const ateFrog = evilAteFrogMap.has(evil.id);
    const bodyCheck = ateFrog ? evil.snake : evil.snake.slice(0, -1);
    if (bodyCheck.some((s) => s.x === head.x && s.y === head.y)) {
      evilsToKill.add(evil.id);
      evilsToRespawn.add(evil.id);
    }
  }

  for (const { evil, head } of evilMoves) {
    if (evilsToKill.has(evil.id)) continue;
    for (const other of evilMoves) {
      if (other.evil.id === evil.id || evilsToKill.has(other.evil.id)) continue;
      const otherBody = other.evil.snake.slice(1);
      if (otherBody.some((s) => s.x === head.x && s.y === head.y)) {
        evilsToKill.add(evil.id);
      }
    }
  }

  if (playerDead) {
    game.lives -= 1;
    if (game.lives <= 0) {
      game.state = 'gameover';
      for (const id of evilsToKill) {
        const evil = game.evilSnakes.find((e) => e.id === id);
        if (evil) evil.alive = false;
      }
      return { event: 'gameover', events };
    }
    respawnPlayer(game);
    events.push({ event: 'loseLife', lives: game.lives });
    for (const id of evilsToKill) {
      const evil = game.evilSnakes.find((e) => e.id === id);
      if (evil) evil.alive = false;
    }
    game.evilSnakes = game.evilSnakes.filter((e) => e.alive);
    for (const id of evilsToRespawn) {
      respawnEvil(game);
      events.push({ event: 'evilRespawn' });
    }
    if (game.evilSnakes.filter((e) => e.alive).length === 0) {
      respawnEvil(game);
      events.push({ event: 'evilRespawn' });
    }
    return events.length ? { events } : { event: 'loseLife' };
  }

  if (playerAteBomb) {
    game.bomb = null;
    events.push({ event: 'bombDetonate' });
    for (const evil of aliveEvils) {
      evilsToKill.add(evil.id);
      evilsKilledByBomb.add(evil.id);
    }
  } else if (evilAteBombId !== null) {
    game.bomb = null;
    events.push({ event: 'bombConsumed' });
  }

  applyPlayerMove(game, playerHead, playerAteFrog);
  if (playerAteFrog) events.push({ event: 'eat' });

  if (playerAteHeart) {
    game.lives = Math.min(MAX_LIVES, game.lives + 1);
    game.heart = null;
    events.push({ event: 'heartEat', lives: game.lives });
  }

  if (playerShrink) {
    if (game.snake.length > 1) game.snake.pop();
  }

  for (const { evil, head } of evilMoves) {
    if (evilsToKill.has(evil.id)) {
      evil.alive = false;
      const reason = evilsKilledByBomb.has(evil.id)
        ? 'bomb'
        : evilsToRespawn.has(evil.id)
          ? 'self'
          : 'collision';
      events.push({ event: 'evilDie', reason });
      continue;
    }
    const ateFrog = evilAteFrogMap.has(evil.id);
    applyEvilMove(evil, head, ateFrog);
    if (ateFrog) {
      events.push({ event: 'evilEat' });
      spawnFrog(game);
      if (evil.snake.length >= EVIL_SPLIT_LENGTH) {
        splitEvilSnake(game, evil);
        events.push({ event: 'evilSplit' });
      }
    }
  }

  game.evilSnakes = game.evilSnakes.filter((e) => e.alive);

  for (const id of evilsToRespawn) {
    respawnEvil(game);
    events.push({ event: 'evilRespawn' });
  }

  if (game.evilSnakes.filter((e) => e.alive).length === 0) {
    respawnEvil(game);
    events.push({ event: 'evilRespawn' });
  }

  return events.length ? { events } : { event: 'move' };
}

export function updateAnimations(game, delta) {
  if (game.frogPulse > 0) {
    game.frogPulse = Math.max(0, game.frogPulse - delta * 0.003);
  }
  if (game.heartPulse > 0) {
    game.heartPulse = Math.max(0, game.heartPulse - delta * 0.003);
  }
  if (game.bombPulse > 0) {
    game.bombPulse = Math.max(0, game.bombPulse - delta * 0.003);
  }
}
