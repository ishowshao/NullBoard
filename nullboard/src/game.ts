// Every puzzle starts empty and is scrambled with legal moves, so it is solvable.
export const SIZE = 4;
export const levels = [
  { name: '入职培训', memo: '只要再点一下，事情就会少一点。也可能多一点。', scramble: [5, 10] },
  { name: '跨部门协作', memo: '你处理的不是待办，是待办的亲戚。', scramble: [0, 6, 15] },
  { name: '季度归零', memo: '本季度 KPI：没有任何 KPI。', scramble: [1, 4, 10, 15] },
];
export function toggle(board: boolean[], index: number): boolean[] {
  if (!Number.isInteger(index) || index < 0 || index >= SIZE * SIZE) return board;
  const row = Math.floor(index / SIZE), col = index % SIZE;
  return board.map((value, i) => Math.abs(Math.floor(i / SIZE) - row) + Math.abs(i % SIZE - col) <= 1 ? !value : value);
}
export function initialBoard(level: number): boolean[] {
  return levels[level].scramble.reduce(toggle, Array<boolean>(SIZE * SIZE).fill(false));
}
