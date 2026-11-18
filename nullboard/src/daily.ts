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

// Previous seven UTC+8 calendar dates. Date-only UTC arithmetic avoids host DST.
export function previousDailyDates(today = dailyDate()): string[] {
  const midnight = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, i) =>
    new Date(midnight - (i + 1) * 86400000).toISOString().slice(0, 10));
}

// Receipt links reproduce the same puzzle even after it leaves the seven-day archive.
export function sharedDailyDate(search: string, today = dailyDate()): string | undefined {
  const dates = new URLSearchParams(search).getAll('daily');
  const date = dates[0];
  if (dates.length !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) return undefined;
  const midnight = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== date) return undefined;
  return date;
}

export function dailyChallengeUrl(date: string): string {
  return `https://ishowshao.github.io/NullBoard/?daily=${encodeURIComponent(date)}`;
}
