import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';
import { copyAllRules, initialBoard, levels, SIZE, solve, toggle } from './game';

function cell(index: number) { return screen.getByRole('button', { name: new RegExp(`第${Math.floor(index / SIZE) + 1}行第${index % SIZE + 1}列`) }); }
function control(name: string) { return screen.getByRole('button', { name }); }
function readBoard() { return Array.from({ length: SIZE * SIZE }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true'); }

test('rehearsal previews corners and replacement moves without changing the board or move count', () => {
  render(<Game />);
  const original = readBoard();
  expect(control('演练模式')).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(control('演练模式'));
  expect(screen.getByText(/演练中：点击格子预览/)).toBeInTheDocument();
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(cell(3));
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(3);
  [2, 3, 7].forEach(i => expect(cell(i)).toHaveAccessibleName(/演练后/));
  expect(cell(3)).toHaveAccessibleName(/演练起点/);
  expect(cell(4)).not.toHaveAccessibleName(/演练后/);
  expect(readBoard()).toEqual(original);
  expect(control('撤销')).toBeDisabled();
  expect(screen.getByText(/演练第 1 行第 4 列/)).toHaveTextContent(`待办 ${original.filter(Boolean).length} → ${toggle(original, 3).filter(Boolean).length} 项`);
  fireEvent.click(cell(5));
  fireEvent.click(cell(5));
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(5);
  expect(readBoard()).toEqual(original);
  expect(control('撤销')).toBeDisabled();
  fireEvent.click(control('执行这一步'));
  expect(readBoard()).toEqual(toggle(original, 5));
  expect(control('执行这一步')).toBeDisabled();
  expect(screen.queryByRole('button', { name: /演练后/ })).not.toBeInTheDocument();
  expect(cell(5)).toHaveFocus();
  expect(screen.getByText(/已操作/)).toHaveTextContent('已操作 1 次');
  fireEvent.click(control('撤销'));
  expect(readBoard()).toEqual(original);
});

test('cancel, disabling rehearsal, hints, undo and restart remove stale previews', () => {
  render(<Game />);
  fireEvent.click(cell(0));
  const partial = readBoard();
  fireEvent.click(control('演练模式'));
  fireEvent.click(cell(5));
  fireEvent.click(control('取消演练'));
  expect(cell(5)).toHaveFocus();
  expect(readBoard()).toEqual(partial);
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(cell(6));
  fireEvent.click(control('演练模式'));
  expect(screen.queryByRole('button', { name: /演练后/ })).not.toBeInTheDocument();
  expect(screen.getByText(/键盘方向键移动，空格或回车翻转/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '执行这一步' })).not.toBeInTheDocument();
  expect(readBoard()).toEqual(partial);
  fireEvent.click(control('演练模式'));
  fireEvent.click(cell(2));
  fireEvent.click(control('求助同事'));
  expect(screen.queryByRole('button', { name: /演练后/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /建议点击/ }));
  expect(screen.queryByRole('button', { name: /建议点击/ })).not.toBeInTheDocument();
  expect(readBoard()).toEqual(partial);
  fireEvent.click(control('撤销'));
  expect(readBoard()).toEqual(initialBoard(0));
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(cell(7));
  fireEvent.click(control('重开本关'));
  expect(control('执行这一步')).toBeDisabled();
  expect(cell(0)).toHaveFocus();
});

test('rehearsal survives museum visits, confirms victory and works across levels and overtime', () => {
  render(<Game />);
  fireEvent.click(control('演练模式'));
  fireEvent.click(cell(5));
  fireEvent.click(screen.getByRole('button', { name: /参观旧版/ }));
  fireEvent.click(screen.getByRole('button', { name: /返回清空/ }));
  expect(cell(5)).toHaveAccessibleName(/演练起点/);
  expect(readBoard()).toEqual(initialBoard(0));
  levels.forEach((_level, i) => {
    const solution = solve(readBoard())!;
    solution.slice(0, -1).forEach(index => {
      fireEvent.click(cell(index));
      fireEvent.click(control('执行这一步'));
    });
    fireEvent.click(cell(solution[solution.length - 1]));
    expect(screen.getByText(/执行这一步即可下班/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /下一关|抽一份临时待办/ })).not.toBeInTheDocument();
    fireEvent.click(control('执行这一步'));
    expect(screen.getByText(/完美摸鱼/)).toBeInTheDocument();
    expect(screen.getByText(/本关已清空|全部 5 关通关/)).toHaveFocus();
    expect(control('演练模式')).toBeDisabled();
    if (i < levels.length - 1) {
      fireEvent.click(screen.getByRole('button', { name: /下一关/ }));
    }
    expect(screen.queryByRole('button', { name: /演练起点/ })).not.toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('button', { name: /^抽一份临时待办/ }));
  const original = readBoard();
  fireEvent.click(cell(4));
  expect(readBoard()).toEqual(original);
  fireEvent.click(control('执行这一步'));
  expect(readBoard()).toEqual(toggle(original, 4));
  fireEvent.click(control('撤销'));
  expect(readBoard()).toEqual(original);
  fireEvent.click(cell(3));
  fireEvent.click(screen.getByRole('button', { name: /重新入职/ }));
  expect(readBoard()).toEqual(initialBoard(0));
  expect(control('执行这一步')).toBeDisabled();
});

test('keyboard can preview, cancel and confirm without counting selection as a move', () => {
  render(<Game />);
  control('演练模式').focus();
  userEvent.keyboard('{Enter}');
  cell(0).focus();
  userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
  expect(cell(5)).toHaveFocus();
  expect(cell(5)).toHaveAccessibleName(/演练起点/);
  expect(control('撤销')).toBeDisabled();
  control('取消演练').focus();
  userEvent.keyboard(' ');
  expect(cell(5)).toHaveFocus();
  expect(control('执行这一步')).toBeDisabled();
  userEvent.keyboard(' ');
  control('执行这一步').focus();
  userEvent.keyboard('{Enter}{Enter}');
  // The second Enter selects a fresh preview after focus returns, not a second move.
  expect(screen.getByText(/已操作/)).toHaveTextContent('已操作 1 次');
  expect(readBoard()).toEqual(toggle(initialBoard(0), 5));
});

test('keyboard rehearsal of a hint previews the move without playing or throwing away redo', () => {
  render(<Game />);
  fireEvent.click(cell(0));
  fireEvent.click(control('撤销'));
  const original = readBoard();
  const hint = solve(original)![0];
  expect(screen.queryByRole('button', { name: '演练建议一步' })).not.toBeInTheDocument();
  control('求助同事').focus();
  userEvent.keyboard('{Enter}');
  expect(control('求助同事')).toHaveFocus();
  userEvent.tab();
  expect(control('重开本关')).toHaveFocus();
  userEvent.tab();
  expect(control('演练建议一步')).toHaveFocus();
  userEvent.keyboard('{Enter}{Enter}');
  expect(screen.getByText(/演练第/)).toHaveFocus();
  expect(cell(hint)).toHaveAccessibleName(/演练起点/);
  expect(control('演练模式')).toHaveAttribute('aria-pressed', 'true');
  expect(control('重做')).toBeEnabled();
  expect(screen.getByText(/已操作/)).toHaveTextContent('已操作 0 次');
  expect(readBoard()).toEqual(original);
  userEvent.tab();
  expect(control('执行这一步')).toHaveFocus();
  userEvent.tab();
  expect(control('取消演练')).toHaveFocus();
  userEvent.keyboard(' ');
  expect(readBoard()).toEqual(original);
  expect(control('重做')).toBeEnabled();
  expect(control('执行这一步')).toBeDisabled();
  expect(cell(hint)).toHaveFocus();
});

test('a daily challenge hint rehearses the seven-cell rule and confirmation plays precisely one move', () => {
  render(<Game />);
  fireEvent.click(screen.getByRole('button', { name: /领取今日全员抄送/ }));
  fireEvent.click(control('演练模式'));
  const original = readBoard();
  const hint = copyAllRules.solve(original)![0];
  fireEvent.click(cell(hint));
  fireEvent.click(control('求助同事'));
  expect(control('执行这一步')).toBeDisabled();
  fireEvent.click(control('演练建议一步'));
  expect(screen.getByText(/演练第/)).toHaveFocus();
  expect(cell(hint)).toHaveAccessibleName(/演练起点/);
  const after = copyAllRules.toggle(original, hint);
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(7);
  const marked = after.map((_, i) => /演练后/.test(cell(i).getAttribute('aria-label')!));
  expect(marked).toEqual(after.map((active, i) => active !== original[i]));
  expect(readBoard()).toEqual(original);
  userEvent.tab();
  expect(control('执行这一步')).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(readBoard()).toEqual(after);
  expect(screen.getByText(/已操作/)).toHaveTextContent('已操作 1 次');
  expect(screen.queryByRole('button', { name: /演练起点|演练建议一步/ })).not.toBeInTheDocument();
});

test('a winning hint still requires deliberate confirmation and then focuses the result', () => {
  render(<Game />);
  solve(initialBoard(0))!.slice(0, -1).forEach(index => fireEvent.click(cell(index)));
  const almost = readBoard();
  fireEvent.click(control('求助同事'));
  control('演练建议一步').focus();
  userEvent.keyboard('{Enter}{Enter}');
  expect(screen.getByText(/执行这一步即可下班/)).toHaveFocus();
  expect(readBoard()).toEqual(almost);
  userEvent.tab();
  expect(control('执行这一步')).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(readBoard().some(Boolean)).toBe(false);
  expect(screen.getByText(/本关已清空/)).toHaveFocus();
});

test('optional rehearsal distance distinguishes a detour from a shorter solution without making a move', () => {
  render(<Game />);
  const original = readBoard();
  fireEvent.click(control('演练模式'));
  fireEvent.click(cell(0));
  const distance = screen.getByRole('checkbox', { name: '显示最少还要几步' });
  expect(distance).not.toBeChecked();
  expect(screen.queryByText(/最少还需/)).not.toBeInTheDocument();
  fireEvent.click(distance);
  expect(screen.getByText(/演练第 1 行第 1 列/)).toHaveTextContent('最少还需 2 → 3 步');
  fireEvent.click(cell(5));
  expect(screen.getByText(/演练第 2 行第 2 列/)).toHaveTextContent('最少还需 2 → 1 步');
  expect(readBoard()).toEqual(original);
  expect(control('撤销')).toBeDisabled();
  fireEvent.click(distance);
  expect(screen.queryByText(/最少还需/)).not.toBeInTheDocument();
  fireEvent.click(control('执行这一步'));
  expect(readBoard()).toEqual(toggle(original, 5));
});

test('daily rehearsal uses the seven-cell solver and leaves undo and redo unchanged', () => {
  render(<Game />);
  fireEvent.click(screen.getByRole('button', { name: /领取今日/ }));
  const original = readBoard(), solution = copyAllRules.solve(original)!;
  const detour = original.findIndex((_, index) => !solution.includes(index));
  fireEvent.click(cell(detour)); fireEvent.click(control('撤销'));
  fireEvent.click(control('演练模式'));
  fireEvent.click(screen.getByRole('checkbox', { name: '显示最少还要几步' }));
  fireEvent.click(cell(detour));
  expect(screen.getByText(/演练第/)).toHaveTextContent('最少还需 6 → 7 步');
  fireEvent.click(cell(solution[0]));
  expect(screen.getByText(/演练第/)).toHaveTextContent('最少还需 6 → 5 步');
  expect(screen.getAllByRole('button', { name: /演练后/ })).toHaveLength(7);
  expect(readBoard()).toEqual(original);
  fireEvent.click(control('取消演练'));
  expect(screen.queryByText(/最少还需/)).not.toBeInTheDocument();
  fireEvent.click(control('重做'));
  expect(readBoard()).toEqual(copyAllRules.toggle(original, detour));
});
