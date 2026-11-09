// Every puzzle starts empty and is scrambled with legal moves, so it is solvable.
export const SIZE = 4;
export const levels = [
  { name: '入职培训', memo: '只要再点一下，事情就会少一点。也可能多一点。', scramble: [5, 10] },
  { name: '跨部门协作', memo: '你处理的不是待办，是待办的亲戚。', scramble: [0, 6, 15] },
  { name: '季度归零', memo: '本季度 KPI：没有任何 KPI。', scramble: [1, 4, 10, 15] },
  { name: '需求复活会', memo: '恭喜清完！会议决定把需求重新加回来。', scramble: [0, 3, 5, 8, 12, 15] },
  { name: '下班审批', memo: '最后一道审批：证明你已经没有任何事值得审批。', scramble: [0, 1, 4, 5, 6, 9, 10] },
];
export function toggle(board: boolean[], index: number): boolean[] {
  if (!Number.isInteger(index) || index < 0 || index >= SIZE * SIZE) return board;
  const row = Math.floor(index / SIZE), col = index % SIZE;
  return board.map((value, i) => Math.abs(Math.floor(i / SIZE) - row) + Math.abs(i % SIZE - col) <= 1 ? !value : value);
}
export function initialBoard(level: number): boolean[] {
  return levels[level].scramble.reduce(toggle, Array<boolean>(SIZE * SIZE).fill(false));
}

export function adjacentCell(index: number, key: string): number {
  const row = Math.floor(index / SIZE), col = index % SIZE;
  if (key === 'ArrowLeft' && col > 0) return index - 1;
  if (key === 'ArrowRight' && col < SIZE - 1) return index + 1;
  if (key === 'ArrowUp' && row > 0) return index - SIZE;
  if (key === 'ArrowDown' && row < SIZE - 1) return index + SIZE;
  return index;
}

// Try each possible first row, then clear each preceding row greedily.
// Every reachable board has a solution; return the shortest candidate.
export function solve(board: boolean[]): number[] | null {
  if (board.length !== SIZE * SIZE) return null;
  let best: number[] | null = null;
  for (let first = 0; first < (1 << SIZE); first += 1) {
    let work = board.slice();
    const moves: number[] = [];
    const press = (index: number) => { work = toggle(work, index); moves.push(index); };
    for (let col = 0; col < SIZE; col += 1) if (first & (1 << col)) press(col);
    for (let row = 1; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (work[(row - 1) * SIZE + col]) press(row * SIZE + col);
      }
    }
    if (!work.some(Boolean) && (best === null || moves.length < best.length)) best = moves;
  }
  return best;
}

// In "reply all", one message reaches the entire row and column (once each).
export function toggleCopyAll(board: boolean[], index: number): boolean[] {
  if (!Number.isInteger(index) || index < 0 || index >= SIZE * SIZE) return board;
  return board.map((value, i) => Math.floor(i / SIZE) === Math.floor(index / SIZE) || i % SIZE === index % SIZE ? !value : value);
}

// On an even-sized square, the row/column toggle matrix is its own inverse.
// Applying it to the lit cells gives the unique (therefore shortest) solution.
export function solveCopyAll(board: boolean[]): number[] | null {
  if (board.length !== SIZE * SIZE) return null;
  const moves = board.reduce((solution, on, i) => on ? toggleCopyAll(solution, i) : solution, Array<boolean>(SIZE * SIZE).fill(false));
  return moves.flatMap((on, i) => on ? [i] : []);
}

export const standardRules = { toggle, solve };
export const copyAllRules = { toggle: toggleCopyAll, solve: solveCopyAll };

// Draw a fresh, reachable board with a short but nontrivial solution.
// Bound retries so even a repeated random value cannot trap the player.
export function overtimeBoard(previous: boolean[] | null = null, random = Math.random, rules = standardRules): boolean[] {
  const differs = (candidate: boolean[]) => !previous || candidate.some((value, i) => value !== previous[i]);
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const available = Array.from({ length: SIZE * SIZE }, (_, i) => i);
    let candidate = Array<boolean>(SIZE * SIZE).fill(false);
    for (let move = 0; move < 4; move += 1) {
      const index = available.splice(Math.floor(random() * available.length), 1)[0];
      candidate = rules.toggle(candidate, index);
    }
    if ((rules.solve(candidate)?.length ?? 0) >= 3 && differs(candidate)) return candidate;
  }
  // These distinct, verified 3–4 move boards are also safe offline fallbacks.
  return [levels[1], levels[2]].map(level => level.scramble.reduce(rules.toggle, Array<boolean>(SIZE * SIZE).fill(false))).find(differs)!;
}
