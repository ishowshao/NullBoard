import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';
import { copyAllRules, initialBoard, levels, overtimeBoard, standardRules, toggle } from './game';
import { GameSnapshot, readSave, SAVE_KEY, writeSave } from './gameSave';
const cell = (i: number) => screen.getByRole('button', { name: new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`) });
const read = () => Array.from({ length: 16 }, (_, i) => cell(i).getAttribute('aria-pressed') === 'true');
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const fresh = (): GameSnapshot => ({ level: 0, board: initialBoard(0), history: [], overtime: null, copyAll: false, challenging: false, rehearsing: false });
beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

test('checkpoints validate campaign and both overtime rules with undo history', () => {
  levels.forEach((_, level) => {
    const start = initialBoard(level), snapshot = { ...fresh(), level, board: toggle(start, 0), history: [start] };
    expect(readSave(writeSave(snapshot))).toEqual(snapshot);
  });
  [standardRules, copyAllRules].forEach(rules => {
    const start = overtimeBoard(null, () => 0, rules, true);
    const snapshot = { ...fresh(), level: levels.length - 1, overtime: start, copyAll: rules === copyAllRules, challenging: true, rehearsing: true, history: [start], board: rules.toggle(start, 0) };
    expect(readSave(writeSave(snapshot))).toEqual(snapshot);
  });
});

test('invalid, future, oversized, impossible and inconsistent saves are ignored', () => {
  const v = { ...fresh(), version: 1 };
  const invalid = [null, '', '{', 'null', '{}', 'x'.repeat(2_000_001), ...[
    { ...v, version: 2 }, { ...v, level: -1 }, { ...v, level: 0.5 }, { ...v, level: levels.length },
    { ...v, board: [true] }, { ...v, board: Array(16).fill(1) }, { ...v, history: null },
    { ...v, history: Array(10001).fill(v.board) }, { ...v, rehearsing: 'false' },
    { ...v, copyAll: true }, { ...v, overtime: v.board }, { ...v, overtime: [] },
    { ...v, level: levels.length - 1, overtime: Array(16).fill(false) },
    { ...v, level: levels.length - 1, overtime: [true, ...Array(15).fill(false)] },
    { ...v, board: toggle(v.board, 0) }, { ...v, history: [v.board], board: v.board },
    { ...v, history: [toggle(v.board, 0)], board: v.board },
  ].map(value => JSON.stringify(value))];
  invalid.forEach(raw => expect(readSave(raw)).toBeNull());
});

test('victory can be saved but moves after victory are rejected', () => {
  const start = initialBoard(0), middle = toggle(start, 5), empty = toggle(middle, 10);
  const finished = { ...fresh(), board: empty, history: [start, middle] };
  expect(readSave(writeSave(finished))).toEqual(finished);
  expect(() => writeSave({ ...finished, history: [start, middle, empty], board: toggle(empty, 0) })).toThrow();
});

test('no automatic writes; reload starts fresh and explicit restore preserves undo and focus', () => {
  const set = jest.spyOn(Storage.prototype, 'setItem');
  const { unmount } = render(<Game />);
  fireEvent.click(cell(0)); expect(set).not.toHaveBeenCalled();
  const before = read(); click('保存当前局'); expect(set).toHaveBeenCalledTimes(1);
  fireEvent.click(cell(3)); expect(set).toHaveBeenCalledTimes(1);
  unmount(); render(<Game />); expect(read()).toEqual(initialBoard(0));
  click('读取存档（替换当前局）'); expect(read()).toEqual(before); expect(cell(0)).toHaveFocus();
  click('撤销'); expect(read()).toEqual(initialBoard(0)); expect(set).toHaveBeenCalledTimes(1);
});

test.each([false, true])('hard overtime restores all game state, hints, preview, undo and victory (copyAll=%s)', copyAll => {
  const rules = copyAll ? copyAllRules : standardRules, start = overtimeBoard(null, () => 0, rules, true);
  const snapshot = { ...fresh(), level: levels.length - 1, board: rules.toggle(start, 0), history: [start], overtime: start, copyAll, challenging: true, rehearsing: true };
  localStorage.setItem(SAVE_KEY, writeSave(snapshot));
  render(<Game />); click('求助同事'); click('演练模式'); fireEvent.click(cell(2));
  click('读取存档（替换当前局）'); expect(read()).toEqual(snapshot.board);
  expect(screen.queryByRole('button', { name: /建议点击|演练起点/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '演练模式' })).toHaveAttribute('aria-pressed', 'true');
  click('撤销'); expect(read()).toEqual(start);
  fireEvent.click(cell(1)); click('执行这一步'); click('重开本关'); expect(read()).toEqual(start);
  click('演练模式'); rules.solve(start)!.forEach(i => fireEvent.click(cell(i)));
  expect(screen.getByRole('radio', { name: /硬核加班/ })).toBeChecked();
  click('覆盖存档为当前局'); click(/重新入职/); click('读取存档（替换当前局）');
  expect(read().some(Boolean)).toBe(false);
  expect(screen.getByText(copyAll ? /全员抄送已清空/ : /临时待办已清空/)).toHaveFocus();
  click('撤销'); expect(read().some(Boolean)).toBe(true);
  click(/参观旧版/); click(/返回清空/); expect(read().some(Boolean)).toBe(true);
});

test('saving an uncommitted rehearsal preview stores only the real board', () => {
  render(<Game />); click('演练模式'); fireEvent.click(cell(0)); click('保存当前局');
  expect(readSave(localStorage.getItem(SAVE_KEY))).toEqual({ ...fresh(), rehearsing: true });
  click('执行这一步'); click('读取存档（替换当前局）');
  expect(read()).toEqual(initialBoard(0)); expect(screen.queryByRole('button', { name: /演练起点/ })).not.toBeInTheDocument();
});

test('keyboard save, overwrite and delete touch only the game key and preserve current play', () => {
  localStorage.setItem('unrelated', 'keep'); render(<Game />);
  screen.getByRole('button', { name: '保存当前局' }).focus(); userEvent.keyboard('{Enter}');
  fireEvent.click(cell(4)); click('覆盖存档为当前局');
  expect(readSave(localStorage.getItem(SAVE_KEY))?.board).toEqual(read()); const current = read();
  screen.getByRole('button', { name: '删除本机存档' }).focus(); userEvent.keyboard(' ');
  expect(localStorage.getItem(SAVE_KEY)).toBeNull(); expect(localStorage.getItem('unrelated')).toBe('keep'); expect(read()).toEqual(current);
  expect(screen.getByRole('button', { name: '保存当前局' })).toHaveFocus();
});

test('corrupt saves can be deleted or overwritten without replacing current play', () => {
  localStorage.setItem(SAVE_KEY, '{broken'); render(<Game />); fireEvent.click(cell(0)); const current = read();
  expect(screen.getByText(/存档损坏/)).toBeInTheDocument(); expect(screen.queryByRole('button', { name: /读取存档/ })).not.toBeInTheDocument();
  click('删除本机存档'); expect(read()).toEqual(current); click('保存当前局');
  expect(readSave(localStorage.getItem(SAVE_KEY))?.board).toEqual(current);
});

test('restore rereads changed or deleted checkpoints without relying on cached metadata', () => {
  localStorage.setItem(SAVE_KEY, writeSave(fresh())); render(<Game />);
  const other = { ...fresh(), level: 2, board: initialBoard(2) }; localStorage.setItem(SAVE_KEY, writeSave(other));
  click('读取存档（替换当前局）'); expect(read()).toEqual(other.board); localStorage.removeItem(SAVE_KEY);
  screen.getByRole('button', { name: /读取存档/ }).focus(); click('读取存档（替换当前局）');
  expect(read()).toEqual(other.board); expect(screen.getByRole('button', { name: '保存当前局' })).toHaveFocus();
  expect(screen.getByText(/没有可读取的有效存档/)).toBeInTheDocument();
});

test('other-tab create, corruption and deletion refresh metadata and preserve keyboard focus', () => {
  render(<Game />); cell(0).focus(); localStorage.setItem(SAVE_KEY, writeSave(fresh()));
  fireEvent(window, new StorageEvent('storage', { key: SAVE_KEY }));
  expect(screen.getByRole('button', { name: '覆盖存档为当前局' })).toBeInTheDocument(); expect(cell(0)).toHaveFocus();
  screen.getByRole('button', { name: /读取存档/ }).focus(); localStorage.setItem(SAVE_KEY, '{}');
  fireEvent(window, new StorageEvent('storage', { key: SAVE_KEY }));
  expect(screen.getByRole('button', { name: '覆盖存档为当前局' })).toHaveFocus();
  screen.getByRole('button', { name: '删除本机存档' }).focus(); localStorage.clear();
  fireEvent(window, new StorageEvent('storage', { key: null }));
  expect(screen.getByRole('button', { name: '保存当前局' })).toHaveFocus(); expect(read()).toEqual(initialBoard(0));
});

test('unavailable storage and quota errors do not block play or destroy an older save', () => {
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  render(<Game />); expect(screen.getByText(/本机存档暂不可用/)).toBeInTheDocument();
  fireEvent.click(cell(0)); expect(read()).toEqual(toggle(initialBoard(0), 0)); get.mockRestore();
  const old = writeSave(fresh()); localStorage.setItem(SAVE_KEY, old);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  click('保存当前局'); expect(screen.getByText(/保存失败/)).toBeInTheDocument(); expect(localStorage.getItem(SAVE_KEY)).toBe(old);
  expect(read()).toEqual(toggle(initialBoard(0), 0));
});

test('failed reads and deletion keep current board and checkpoint', () => {
  const old = writeSave(fresh()); localStorage.setItem(SAVE_KEY, old); render(<Game />); fireEvent.click(cell(0)); const current = read();
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  click('读取存档（替换当前局）'); expect(screen.getByText(/读取失败/)).toBeInTheDocument(); get.mockRestore();
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
  click('删除本机存档'); expect(screen.getByText(/删除失败/)).toBeInTheDocument(); expect(read()).toEqual(current); expect(localStorage.getItem(SAVE_KEY)).toBe(old);
});
