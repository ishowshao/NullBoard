import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { adjacentCell, initialBoard, levels, overtimeBoard, SIZE, solve, toggle } from './game';

function cell(index: number) { return screen.getByRole('button', { name: new RegExp(`第${Math.floor(index / SIZE) + 1}行第${index % SIZE + 1}列`) }); }

test('corner toggles itself and orthogonal neighbors without wrapping', () => {
  const empty = Array<boolean>(16).fill(false);
  expect(toggle(empty, 3).map((on, i) => on ? i : -1).filter(i => i >= 0)).toEqual([2, 3, 7]);
  expect(toggle(toggle(empty, 3), 3)).toEqual(empty);
  expect(toggle(empty, -1)).toBe(empty);
});

test.each(levels.map((level, index) => [level.name, index] as const))('%s is nonempty and solvable through legal moves', (_name, index) => {
  expect(initialBoard(index).some(Boolean)).toBe(true);
  expect(levels[index].scramble.reduce(toggle, initialBoard(index)).some(Boolean)).toBe(false);
});

test('play, undo, restart and museum round trip preserve the current game', () => {
  render(<Game />);
  expect(screen.getByRole('heading', { name: /清空.*待办局/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  const before = cell(0).getAttribute('aria-pressed');
  fireEvent.click(cell(0));
  expect(cell(0).getAttribute('aria-pressed')).not.toBe(before);
  fireEvent.click(screen.getByRole('button', { name: /参观旧版/ }));
  expect(screen.getByRole('heading', { name: 'NullBoard Pro Max' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /返回清空/ }));
  expect(cell(0).getAttribute('aria-pressed')).not.toBe(before);
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  expect(cell(0).getAttribute('aria-pressed')).toBe(before);
  fireEvent.click(cell(2));
  fireEvent.click(screen.getByRole('button', { name: '重开本关' }));
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  initialBoard(0).forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', String(on)));
});

test('all levels can be completed, undo reverses victory, replay starts fresh', () => {
  render(<Game />);
  levels.forEach((level, i) => {
    level.scramble.forEach(index => fireEvent.click(cell(index)));
    expect(cell(0)).toBeDisabled();
    if (i < levels.length - 1) fireEvent.click(screen.getByRole('button', { name: /下一关/ }));
  });
  expect(screen.getByText(/首席虚无官/)).toHaveTextContent('首席虚无官');
  fireEvent.click(screen.getByRole('button', { name: /重新入职/ }));
  expect(screen.getByText(`第 1 / ${levels.length} 关 · 入职培训`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
});

test('undo reverses victory and hides advancement', () => {
  render(<Game />);
  levels[0].scramble.forEach(index => fireEvent.click(cell(index)));
  expect(cell(0)).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  expect(cell(0)).toBeEnabled();
  expect(screen.queryByRole('button', { name: /下一关/ })).not.toBeInTheDocument();
  fireEvent.click(cell(10));
  expect(screen.getByRole('button', { name: /下一关/ })).toBeInTheDocument();
});


test('arrow navigation keeps focus inside the board without making moves', () => {
  render(<Game />);
  cell(0).focus();
  fireEvent.keyDown(cell(0), { key: 'ArrowRight' });
  expect(cell(1)).toHaveFocus();
  fireEvent.keyDown(cell(1), { key: 'ArrowDown' });
  expect(cell(5)).toHaveFocus();
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  cell(3).focus();
  fireEvent.keyDown(cell(3), { key: 'ArrowRight' });
  expect(cell(3)).toHaveFocus();
  expect(adjacentCell(0, 'ArrowUp')).toBe(0);
  expect(adjacentCell(12, 'ArrowDown')).toBe(12);
  expect(adjacentCell(4, 'ArrowLeft')).toBe(4);
  expect(adjacentCell(5, 'Enter')).toBe(5);
});


test('solver finds a route from every level and after arbitrary moves', () => {
  levels.forEach((_level, index) => {
    const board = [0, 7, 12].reduce(toggle, initialBoard(index));
    const solution = solve(board);
    expect(solution).not.toBeNull();
    expect(solution!.reduce(toggle, board).some(Boolean)).toBe(false);
  });
  expect(solve(Array<boolean>(16).fill(false))).toEqual([]);
});

test('asking for a hint does not move; playing it and undo clear the hint', () => {
  render(<Game />);
  fireEvent.click(screen.getByRole('button', { name: '求助同事' }));
  const suggested = screen.getByRole('button', { name: /建议点击/ });
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  expect(screen.getByText(/同事建议：点击/)).toBeInTheDocument();
  fireEvent.click(suggested);
  expect(screen.queryByRole('button', { name: /建议点击/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '求助同事' }));
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  expect(screen.queryByRole('button', { name: /建议点击/ })).not.toBeInTheDocument();
});


test('victory compares moves to the optimum and undo or restart clears the result', () => {
  render(<Game />);
  levels[0].scramble.forEach(index => fireEvent.click(cell(index)));
  expect(screen.getByText(/完美摸鱼：2 步/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  expect(screen.queryByText(/完美摸鱼/)).not.toBeInTheDocument();
  fireEvent.click(cell(10));
  fireEvent.click(screen.getByRole('button', { name: '重开本关' }));
  fireEvent.click(cell(0)); fireEvent.click(cell(0));
  levels[0].scramble.forEach(index => fireEvent.click(cell(index)));
  expect(screen.getByText(/本关最少 2 步，你用了 4 步/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /下一关/ }));
  expect(screen.queryByText(/本关最少/)).not.toBeInTheDocument();
});

test('overtime draws are reachable, nontrivial and different from the previous board', () => {
  // A deterministic stream exercises many draws without making the test flaky.
  let seed = 7;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
  let previous: boolean[] | null = null;
  for (let draw = 0; draw < 100; draw += 1) {
    const board = overtimeBoard(previous, random);
    const solution = solve(board)!;
    expect(board).toHaveLength(SIZE * SIZE);
    expect(board).not.toEqual(previous);
    expect(solution.length).toBeGreaterThanOrEqual(3);
    expect(solution.length).toBeLessThanOrEqual(4);
    expect(solution.reduce(toggle, board).some(Boolean)).toBe(false);
    previous = board;
  }
});

test('overtime retries are bounded and fallback cannot repeat the previous board', () => {
  const random = jest.fn(() => 0);
  const first = overtimeBoard(null, random);
  random.mockClear();
  const second = overtimeBoard(first, random);
  expect(random).toHaveBeenCalledTimes(24 * 4);
  expect(second).not.toEqual(first);
  expect(solve(second)!.length).toBeGreaterThanOrEqual(3);
  // A new four-move draw differs from the three-move fallback too.
  const repeating = jest.fn().mockReturnValue(0);
  const third = overtimeBoard(second, repeating);
  expect(third).not.toEqual(second);
  expect(third).toEqual(first);
  expect(solve(third)!.length).toBeLessThanOrEqual(4);
});

test('overtime unlocks after the finale, keeps its board on restart and museum visits, and can be replayed', () => {
  render(<Game />);
  expect(screen.queryByRole('button', { name: /抽一份临时待办/ })).not.toBeInTheDocument();
  levels.forEach((level, i) => {
    level.scramble.forEach(index => fireEvent.click(cell(index)));
    if (i < levels.length - 1) fireEvent.click(screen.getByRole('button', { name: /下一关/ }));
  });
  fireEvent.click(screen.getByRole('button', { name: /^抽一份临时待办/ }));
  expect(screen.getByText('番外 · 临时加班')).toBeInTheDocument();
  expect(cell(0)).toHaveFocus();
  expect(screen.queryByText(/首席虚无官/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  const original = Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
  fireEvent.click(screen.getByRole('button', { name: '求助同事' }));
  fireEvent.click(screen.getByRole('button', { name: /建议点击/ }));
  fireEvent.click(screen.getByRole('button', { name: '求助同事' }));
  const partial = Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed'));
  const hintLabel = screen.getByRole('button', { name: /建议点击/ }).getAttribute('aria-label');
  fireEvent.click(screen.getByRole('button', { name: /参观旧版/ }));
  fireEvent.click(screen.getByRole('button', { name: /返回清空/ }));
  partial.forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', on));
  expect(screen.getByRole('button', { name: /建议点击/ })).toHaveAttribute('aria-label', hintLabel);
  expect(screen.getByRole('button', { name: '撤销' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  original.forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', String(on)));
  fireEvent.click(cell(0));
  fireEvent.click(screen.getByRole('button', { name: '求助同事' }));
  fireEvent.click(screen.getByRole('button', { name: '重开本关' }));
  original.forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', String(on)));
  expect(screen.queryByRole('button', { name: /建议点击/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /参观旧版/ }));
  fireEvent.click(screen.getByRole('button', { name: /返回清空/ }));
  expect(screen.getByText('番外 · 临时加班')).toBeInTheDocument();
  original.forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', String(on)));
  solve(original)!.forEach(index => fireEvent.click(cell(index)));
  expect(screen.getByText(/临时待办已清空/)).toBeInTheDocument();
  expect(screen.getByText(/完美摸鱼/)).toHaveTextContent(`完美摸鱼：${solve(original)!.length} 步`);
  fireEvent.click(screen.getByRole('button', { name: '撤销' }));
  expect(screen.queryByRole('button', { name: /再抽一份/ })).not.toBeInTheDocument();
  const remaining = Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
  solve(remaining)!.forEach(index => fireEvent.click(cell(index)));
  fireEvent.click(screen.getByRole('button', { name: /再抽一份临时待办/ }));
  const next = Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
  expect(next).not.toEqual(original);
  expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  expect(cell(0)).toHaveFocus();
  expect(screen.queryByText(/完美摸鱼/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重新入职/ }));
  expect(screen.queryByText('番外 · 临时加班')).not.toBeInTheDocument();
  initialBoard(0).forEach((on, i) => expect(cell(i)).toHaveAttribute('aria-pressed', String(on)));
  expect(cell(0)).toHaveFocus();
});
