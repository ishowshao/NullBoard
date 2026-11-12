import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import DailyChallenge from './DailyChallenge';
import { dailyBoard, dailyDate } from './daily';
import { copyAllRules } from './game';
const cell = (i: number) => screen.getByRole('button', { name: new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`) });
const read = () => Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
afterEach(() => { jest.useRealTimers(); window.localStorage.clear(); });
test('daily date rolls at UTC+8 midnight across month and year boundaries', () => {
  expect(dailyDate(new Date('2026-11-11T15:59:59Z'))).toBe('2026-11-11');
  expect(dailyDate(new Date('2026-11-11T16:00:00Z'))).toBe('2026-11-12');
  expect(dailyDate(new Date('2026-12-31T16:00:00Z'))).toBe('2027-01-01');
});
test('v1 daily boards are deterministic, reachable and hard for a full year', () => {
  let previous: boolean[] | null = null;
  for (let day = 0; day < 365; day++) {
    const date = dailyDate(new Date(Date.UTC(2026, 0, 1 + day)));
    const board = dailyBoard(date), solution = copyAllRules.solve(board)!;
    expect(board).toEqual(dailyBoard(date));
    expect(solution.length).toBeGreaterThanOrEqual(5);
    expect(solution.length).toBeLessThanOrEqual(6);
    expect(solution.reduce(copyAllRules.toggle, board).some(Boolean)).toBe(false);
    expect(board).not.toEqual(previous); previous = board;
  }
});
test('date refresh never starts a game and clicking after midnight uses the current date', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-11T15:59:59Z'));
  const onStart = jest.fn(); const view = render(<DailyChallenge onStart={onStart} />);
  expect(screen.getByText(/今日派单/)).toHaveTextContent('2026-11-11');
  act(() => { jest.advanceTimersByTime(30000); });
  expect(screen.getByText(/今日派单/)).toHaveTextContent('2026-11-12');
  expect(onStart).not.toHaveBeenCalled();
  jest.setSystemTime(new Date('2026-11-12T16:00:00Z'));
  click(/领取今日/); expect(onStart).toHaveBeenCalledWith('2026-11-13');
  view.unmount(); expect(jest.getTimerCount()).toBe(0);
});
test('daily puzzle is immediately playable with rehearsal, undo, restart, saves and normal bonus continuation', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-12T12:00:00Z'));
  render(<Game />); fireEvent.click(cell(0)); click('求助同事');
  click(/领取今日/); const board = dailyBoard('2026-11-12');
  expect(read()).toEqual(board); expect(cell(0)).toHaveFocus();
  expect(screen.queryByRole('button', { name: /建议点击/ })).not.toBeInTheDocument();
  click('演练模式'); fireEvent.click(cell(1)); click('取消演练'); expect(read()).toEqual(board);
  fireEvent.click(cell(1)); click('执行这一步'); click('撤销'); expect(read()).toEqual(board);
  click('重开本关'); expect(read()).toEqual(board);
  click('保存当前局'); click(/重新入职/); click('读取存档（替换当前局）');
  expect(read()).toEqual(board); expect(cell(0)).toHaveFocus();
  click(/参观旧版/); click(/返回清空/); expect(read()).toEqual(board);
  click('演练模式');
  copyAllRules.solve(board)!.forEach(i => fireEvent.click(cell(i)));
  expect(screen.getByText(/全员抄送已清空/)).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /硬核/ })).toBeChecked();
  click(/再抽一份全员抄送/); expect(read()).not.toEqual(board);
  click(/领取今日/); expect(read()).toEqual(board);
  click(/重新入职/); expect(screen.getByText(/第 1 \/ 5 关/)).toBeInTheDocument();
});
