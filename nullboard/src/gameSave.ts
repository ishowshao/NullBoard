import { copyAllRules, initialBoard, levels, SIZE, standardRules } from './game';

export const SAVE_KEY = 'nullboard.game-save.v1';
export type GameSnapshot = {
  level: number;
  board: boolean[];
  history: boolean[][];
  overtime: boolean[] | null;
  copyAll: boolean;
  challenging: boolean;
  rehearsing: boolean;
};
const isBoard = (value: unknown): value is boolean[] => Array.isArray(value) && value.length === SIZE * SIZE && value.every(cell => typeof cell === 'boolean');
const equal = (a: boolean[], b: boolean[]) => a.every((cell, i) => cell === b[i]);

// Treat local storage as untrusted input. Invalid or future saves never replace a game.
export function readSave(raw: string | null): GameSnapshot | null {
  if (!raw || raw.length > 2_000_000) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Number.isInteger(value.level) || value.level < 0 || value.level >= levels.length ||
      !isBoard(value.board) || !Array.isArray(value.history) || value.history.length > 10000 || !value.history.every(isBoard) ||
      (value.overtime !== null && !isBoard(value.overtime)) ||
      typeof value.copyAll !== 'boolean' || typeof value.challenging !== 'boolean' || typeof value.rehearsing !== 'boolean') return null;
    const snapshot: GameSnapshot = value;
    if ((snapshot.overtime && snapshot.level !== levels.length - 1) || (snapshot.copyAll && !snapshot.overtime)) return null;
    const rules = snapshot.copyAll ? copyAllRules : standardRules;
    const start = snapshot.overtime ?? initialBoard(snapshot.level);
    if (!start.some(Boolean) || rules.solve(start) === null) return null;
    const chain = [...snapshot.history, snapshot.board];
    if (!equal(chain[0], start)) return null;
    // Validate every undo transition, including that no move followed a cleared board.
    for (let step = 1; step < chain.length; step += 1) {
      const previous = chain[step - 1], next = chain[step];
      if (!previous.some(Boolean) || !previous.some((_, i) => equal(rules.toggle(previous, i), next))) return null;
    }
    return { level: snapshot.level, board: snapshot.board, history: snapshot.history, overtime: snapshot.overtime,
      copyAll: snapshot.copyAll, challenging: snapshot.challenging, rehearsing: snapshot.rehearsing };
  } catch { return null; }
}

export function writeSave(snapshot: GameSnapshot): string {
  const raw = JSON.stringify({ ...snapshot, version: 1 });
  if (!readSave(raw)) throw new Error('This game cannot be saved.');
  return raw;
}
