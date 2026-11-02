import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { initialBoard, levels, SIZE, toggle } from './game';

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

test('three levels can be completed, undo reverses victory, replay starts fresh', () => {
  render(<Game />);
  levels.forEach((level, i) => {
    level.scramble.forEach(index => fireEvent.click(cell(index)));
    expect(cell(0)).toBeDisabled();
    if (i < levels.length - 1) fireEvent.click(screen.getByRole('button', { name: /下一关/ }));
  });
  expect(screen.getByRole('status')).toHaveTextContent('首席虚无官');
  fireEvent.click(screen.getByRole('button', { name: /重新入职/ }));
  expect(screen.getByText('第 1 / 3 关 · 入职培训')).toBeInTheDocument();
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
