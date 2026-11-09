import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';
import { copyAllRules, initialBoard, levels, overtimeBoard, SIZE, solveCopyAll, toggle, toggleCopyAll } from './game';

function cell(index: number) { return screen.getByRole('button', { name: new RegExp(`第${Math.floor(index / SIZE) + 1}行第${index % SIZE + 1}列`) }); }
function control(name: string | RegExp) { return screen.getByRole('button', { name }); }
function readBoard() { return Array.from({ length: SIZE * SIZE }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true'); }
function finishCampaign() {
  levels.forEach((level, i) => {
    level.scramble.forEach(index => fireEvent.click(cell(index)));
    if (i < levels.length - 1) fireEvent.click(control(/下一关/));
  });
}

test('copy-all flips exactly one row and column, counting the intersection once', () => {
  const empty = Array<boolean>(SIZE * SIZE).fill(false);
  expect(toggleCopyAll(empty, 5).flatMap((on, i) => on ? [i] : [])).toEqual([1, 4, 5, 6, 7, 9, 13]);
  expect(toggleCopyAll(empty, 0).filter(Boolean)).toHaveLength(7);
  expect(toggleCopyAll(toggleCopyAll(empty, 5), 5)).toEqual(empty);
  [-1, 16, 0.5, NaN].forEach(index => expect(toggleCopyAll(empty, index)).toBe(empty));
  expect(solveCopyAll([])).toBeNull();
});

test('all 65536 copy-all boards have one unique shortest solution', () => {
  // Exhaust all move subsets, not just generated puzzles. An involution is bijective.
  for (let mask = 0; mask < 1 << (SIZE * SIZE); mask += 1) {
    const moves = Array.from({ length: SIZE * SIZE }, (_, i) => i).filter(i => mask & (1 << i));
    const board = moves.reduce(toggleCopyAll, Array<boolean>(SIZE * SIZE).fill(false));
    const solution = solveCopyAll(board)!;
    if (solution.join(',') !== moves.join(',')) throw new Error(`Incorrect inverse at ${mask}`);
  }
  expect(solveCopyAll(Array<boolean>(SIZE * SIZE).fill(false))).toEqual([]);
});

test('copy-all draws and repeated-random fallback stay distinct, reachable and 3–4 moves', () => {
  let seed = 9;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
  let previous: boolean[] | null = null;
  for (let draw = 0; draw < 100; draw += 1) {
    const board = overtimeBoard(previous, random, copyAllRules);
    const solution = solveCopyAll(board)!;
    expect(board).not.toEqual(previous);
    expect(solution.length).toBeGreaterThanOrEqual(3);
    expect(solution.length).toBeLessThanOrEqual(4);
    expect(solution.reduce(toggleCopyAll, board).some(Boolean)).toBe(false);
    previous = board;
  }
  const repeated = jest.fn(() => 0);
  const first = overtimeBoard(null, repeated, copyAllRules);
  repeated.mockClear();
  const fallback = overtimeBoard(first, repeated, copyAllRules);
  expect(repeated).toHaveBeenCalledTimes(24 * 4);
  expect(fallback).not.toEqual(first);
  expect(solveCopyAll(fallback)!.length).toBe(3);
  expect(solveCopyAll(fallback)!.reduce(toggleCopyAll, fallback).some(Boolean)).toBe(false);
});

test('copy-all unlocks after the finale, preserves its rule, supports hints and can switch back', () => {
  render(<Game />);
  expect(screen.queryByRole('button', { name: /挑战全员抄送/ })).not.toBeInTheDocument();
  finishCampaign();
  fireEvent.click(control(/挑战全员抄送/));
  expect(screen.getByText('番外 · 全员抄送')).toBeInTheDocument();
  expect(screen.getByText(/点击任意格子，翻转整行和整列/)).toBeInTheDocument();
  expect(cell(0)).toHaveFocus();
  const original = readBoard();
  fireEvent.click(cell(5));
  expect(readBoard()).toEqual(toggleCopyAll(original, 5));
  fireEvent.click(control(/参观旧版/));
  fireEvent.click(control(/返回清空/));
  expect(readBoard()).toEqual(toggleCopyAll(original, 5));
  expect(screen.getByText('番外 · 全员抄送')).toBeInTheDocument();
  fireEvent.click(control('撤销'));
  expect(readBoard()).toEqual(original);
  fireEvent.click(cell(0));
  fireEvent.click(control('重开本关'));
  expect(readBoard()).toEqual(original);
  expect(control('撤销')).toBeDisabled();
  for (let step = 0; step < solveCopyAll(original)!.length; step += 1) {
    fireEvent.click(control('求助同事'));
    fireEvent.click(control(/建议点击/));
  }
  expect(screen.getByText(/全员抄送已清空/)).toBeInTheDocument();
  expect(screen.getByText(/完美摸鱼/)).toHaveTextContent(`完美摸鱼：${solveCopyAll(original)!.length} 步`);
  fireEvent.click(control('撤销'));
  expect(screen.queryByRole('button', { name: /再抽一份全员/ })).not.toBeInTheDocument();
  solveCopyAll(readBoard())!.forEach(index => fireEvent.click(cell(index)));
  fireEvent.click(control(/再抽一份全员抄送/));
  expect(readBoard()).not.toEqual(original);
  expect(cell(0)).toHaveFocus();
  solveCopyAll(readBoard())!.forEach(index => fireEvent.click(cell(index)));
  fireEvent.click(control(/^抽一份临时待办/));
  expect(screen.getByText('番外 · 临时加班')).toBeInTheDocument();
  const classic = readBoard();
  fireEvent.click(cell(5));
  expect(readBoard()).toEqual(toggle(classic, 5));
  fireEvent.click(control(/重新入职/));
  expect(readBoard()).toEqual(initialBoard(0));
  fireEvent.click(cell(0));
  expect(readBoard()).toEqual(toggle(initialBoard(0), 0));
});

test('copy-all keyboard rehearsal previews seven cells, cancels and confirms with the right rule', () => {
  render(<Game />);
  finishCampaign();
  fireEvent.click(control(/挑战全员抄送/));
  const original = readBoard();
  fireEvent.click(control('演练模式'));
  cell(0).focus();
  userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
  expect(cell(5)).toHaveFocus();
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(7);
  expect(readBoard()).toEqual(original);
  expect(control('撤销')).toBeDisabled();
  fireEvent.click(control('取消演练'));
  expect(cell(5)).toHaveFocus();
  expect(control('执行这一步')).toBeDisabled();
  solveCopyAll(original)!.forEach(index => {
    fireEvent.click(cell(index));
    fireEvent.click(control('执行这一步'));
  });
  expect(screen.getByText(/全员抄送已清空/)).toHaveFocus();
  fireEvent.click(control(/再抽一份全员抄送/));
  expect(control('演练模式')).toHaveAttribute('aria-pressed', 'true');
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(cell(3));
  fireEvent.click(control(/重新入职/));
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(cell(3));
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(3);
});
