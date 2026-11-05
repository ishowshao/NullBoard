import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { adjacentCell, initialBoard, levels, SIZE, solve, toggle } from './game';

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
