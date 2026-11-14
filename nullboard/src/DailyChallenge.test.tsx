import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import DailyChallenge from './DailyChallenge';
import { dailyBoard, dailyDate, previousDailyDates } from './daily';
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

test('archive dates span leap days and year boundaries without host timezone dependence', () => {
  expect(previousDailyDates('2028-03-01')).toEqual(['2028-02-29', '2028-02-28', '2028-02-27', '2028-02-26', '2028-02-25', '2028-02-24', '2028-02-23']);
  expect(previousDailyDates('2027-01-01')[0]).toBe('2026-12-31');
});
test('archive selection does not start a game, stays selected across midnight, and clamps when expired', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-13T15:59:59Z'));
  const onStart = jest.fn(); render(<DailyChallenge onStart={onStart} />);
  const select = screen.getByRole('combobox', { name: /派单日期/ });
  expect(select).toHaveValue('2026-11-12');
  fireEvent.change(select, { target: { value: '2026-11-10' } });
  expect(onStart).not.toHaveBeenCalled();
  act(() => { jest.advanceTimersByTime(30000); });
  expect(select).toHaveValue('2026-11-10');
  click(/领取 2026-11-10/); expect(onStart).toHaveBeenLastCalledWith('2026-11-10');
  jest.setSystemTime(new Date('2026-12-01T12:00:00Z'));
  fireEvent.focus(window);
  expect(select).toHaveValue('2026-11-30');
  expect(onStart).toHaveBeenCalledTimes(1);
  click(/领取 2026-11-30/); expect(onStart).toHaveBeenLastCalledWith('2026-11-30');
});
test('archived puzzle supports solving, restart, replay, undo, and saved progress', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-13T12:00:00Z'));
  render(<Game />); fireEvent.click(cell(0)); const current = read();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '2026-11-08' } });
  expect(read()).toEqual(current);
  click(/领取 2026-11-08/); const board = dailyBoard('2026-11-08');
  expect(read()).toEqual(board); expect(cell(0)).toHaveFocus();
  fireEvent.click(cell(0)); click('撤销'); expect(read()).toEqual(board);
  click('保存当前局'); click(/领取今日/); click('读取存档（替换当前局）');
  expect(read()).toEqual(board);
  copyAllRules.solve(board)!.forEach(i => fireEvent.click(cell(i)));
  expect(screen.getByText(/全员抄送已清空/)).toBeInTheDocument();
  click('重开本关'); expect(read()).toEqual(board);
  click(/领取 2026-11-08/); expect(read()).toEqual(board);
});

test('archive day buttons step, stop at both bounds, and never replace the current board', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-14T12:00:00Z'));
  render(<Game />); fireEvent.click(cell(0)); const before = read();
  const select = screen.getByRole('combobox', { name: /派单日期/ });
  expect(screen.getByRole('button', { name: '后一天 →' })).toBeDisabled();
  for (let i = 0; i < 6; i++) click('← 前一天');
  expect(select).toHaveValue('2026-11-07');
  expect(screen.getByRole('button', { name: '← 前一天' })).toBeDisabled();
  click('← 前一天'); expect(select).toHaveValue('2026-11-07');
  expect(read()).toEqual(before);
  click('后一天 →'); expect(select).toHaveValue('2026-11-08');
  expect(screen.getByText(/待领取：/)).toHaveTextContent('2026-11-08');
  click(/领取 2026-11-08/); expect(read()).toEqual(dailyBoard('2026-11-08'));
  fireEvent.change(select, { target: { value: '2026-11-13' } });
  expect(screen.getByRole('button', { name: '后一天 →' })).toBeDisabled();
});
test('archive navigation recalculates boundaries after midnight without starting a game', () => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-14T15:59:59Z'));
  const onStart = jest.fn(); render(<DailyChallenge onStart={onStart} />);
  click('← 前一天');
  act(() => { jest.advanceTimersByTime(30000); });
  click('后一天 →'); click('后一天 →');
  expect(screen.getByRole('combobox')).toHaveValue('2026-11-14');
  expect(screen.getByRole('button', { name: '后一天 →' })).toBeDisabled();
  expect(onStart).not.toHaveBeenCalled();
  click(/领取 2026-11-14/); expect(onStart).toHaveBeenCalledWith('2026-11-14');
});
