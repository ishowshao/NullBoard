import { dailyChallengeUrl, sharedDailyDate } from './daily';

test('receipt links accept only one real, non-future UTC+8 date, without the archive expiry', () => {
  const today = '2026-11-18';
  const date = '2026-11-06';
  expect(sharedDailyDate(new URL(dailyChallengeUrl(date)).search, today)).toBe(date);
  expect(sharedDailyDate('?daily=' + today, today)).toBe(today);
  expect(sharedDailyDate('?daily=2024-02-29', today)).toBe('2024-02-29');
  for (const query of ['', '?daily=', '?daily=2026-11-19', '?daily=2026-02-29',
    '?daily=2026-2-01', '?daily=2026-11-06&daily=2026-11-06', '?daily=https%3A%2F%2Fexample.com']) {
    expect(sharedDailyDate(query, today)).toBeUndefined();
  }
});
