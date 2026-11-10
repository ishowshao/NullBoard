import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { copyAllRules, levels, overtimeBoard, standardRules } from './game';
const cell = (i: number) => screen.getByRole('button', { name: new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`) });
const read = () => Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
test('challenging draws and bounded fallback are distinct 5–6 move puzzles under both rules', () => {
  [standardRules, copyAllRules].forEach(rules => {
    let seed = 42;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
    let previous: boolean[] | null = null;
    for (let i = 0; i < 100; i++) {
      const board = overtimeBoard(previous, random, rules, true);
      const solution = rules.solve(board)!;
      expect(solution.length).toBeGreaterThanOrEqual(5);
      expect(solution.length).toBeLessThanOrEqual(6);
      expect(solution.reduce(rules.toggle, board).some(Boolean)).toBe(false);
      expect(board).not.toEqual(previous);
      previous = board;
    }
    const first = overtimeBoard(null, () => 0, rules, true);
    const second = overtimeBoard(first, () => 0, rules, true);
    const third = overtimeBoard(second, () => 0, rules, true);
    [first, second, third].forEach(board => expect(rules.solve(board)).toHaveLength(6));
    expect(first).not.toEqual(second);
    expect(second).not.toEqual(third);
  });
});
test('difficulty applies only on draw, works with restart, undo, rehearsal, hints and both rules', () => {
  render(<Game />);
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  levels.forEach((level, i) => { level.scramble.forEach(n => fireEvent.click(cell(n))); if (i < levels.length - 1) click(/下一关/); });
  fireEvent.click(screen.getByRole('radio', { name: /硬核加班/ }));
  expect(read().some(Boolean)).toBe(false);
  click(/挑战全员抄送/);
  const board = read();
  expect(copyAllRules.solve(board)).toHaveLength(6);
  expect(screen.getByText(/规则已改变/)).toHaveTextContent('最少 5–6 步');
  click('演练模式'); fireEvent.click(cell(0)); click('取消演练');
  expect(read()).toEqual(board);
  fireEvent.click(cell(0)); click('执行这一步'); click('撤销');
  expect(read()).toEqual(board);
  click('重开本关'); expect(read()).toEqual(board);
  click('演练模式');
  copyAllRules.solve(board)!.forEach(() => { click('求助同事'); click(/建议点击/); });
  fireEvent.click(screen.getByRole('radio', { name: /轻松摸鱼/ }));
  expect(screen.getByText(/全员抄送已清空/)).toBeInTheDocument();
  expect(screen.getByText(/规则已改变/)).toHaveTextContent('最少 5–6 步');
  click(/^抽一份临时待办/);
  expect(standardRules.solve(read())!.length).toBeLessThanOrEqual(4);
  click(/参观旧版/); click(/返回清空/);
  expect(screen.getByText(/办公室对此深表遗憾/)).toHaveTextContent('最少 3–4 步');
});
