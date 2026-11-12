import { copyAllRules, overtimeBoard } from './game';

// A shared UTC+8 date keeps the same daily puzzle across browser time zones.
export function dailyDate(now = new Date()): string {
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Versioned seed: keep v1 stable so an old date always reproduces its puzzle.
export function dailyBoard(date: string): boolean[] {
  let seed = 2166136261;
  for (const character of `nullboard-daily-v1:${date}`) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return overtimeBoard(null, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  }, copyAllRules, true);
}
