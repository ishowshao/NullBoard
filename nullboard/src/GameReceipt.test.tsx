import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { dailyBoard } from './daily';
import { copyAllRules } from './game';
import { readSave, SAVE_KEY } from './gameSave';

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
afterEach(() => window.localStorage.clear());

test('a receipt follows the claimed archive board, even when browsing or restoring', () => {
  render(<Game />);
  const select = () => screen.getByLabelText<HTMLSelectElement>('派单日期（UTC+8）');
  const day = select().value;
  click(new RegExp(`领取 ${day}`));
  expect(screen.queryByText('分享下班回执')).not.toBeInTheDocument();
  click('← 前一天');
  expect(select().value).not.toBe(day);
  const moves = copyAllRules.solve(dailyBoard(day))!;
  moves.forEach(i => click(new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`)));
  expect(screen.getByText('分享下班回执')).toBeInTheDocument();
  const receipt = () => screen.getByLabelText<HTMLTextAreaElement>('下班回执文案');
  expect(receipt()).toHaveValue(`NullBoard · 下班回执\n${day} 全员抄送（UTC+8）｜${moves.length} 步下班，最少 ${moves.length} 步\nhttps://ishowshao.github.io/NullBoard/?daily=${day}`);
  click('保存当前局');
  const raw = JSON.parse(window.localStorage.getItem(SAVE_KEY)!);
  expect(raw.claimedDate).toBe(day);
  expect(readSave(JSON.stringify({ ...raw, claimedDate: '2026-02-30' }))).toBeNull();
  expect(readSave(JSON.stringify({ ...raw, claimedDate: '2099-01-01' }))).toBeNull();
  delete raw.claimedDate;
  expect(readSave(JSON.stringify(raw))).not.toBeNull();
  click('撤销');
  expect(screen.queryByText('分享下班回执')).not.toBeInTheDocument();
  click('读取存档（替换当前局）');
  expect(receipt().value).toContain(day);
  click(/再抽一份全员抄送/);
  expect(screen.queryByText(/本局派单日期/)).not.toBeInTheDocument();
});

test('a shared older puzzle can be played, but only after explicitly claiming it', () => {
  const original = window.location.href;
  const day = '2026-11-06';
  try {
    window.history.replaceState(null, '', '/NullBoard/?daily=' + day);
    render(<Game />);
    expect(screen.getByRole('heading', { name: '同题挑战 · ' + day })).toBeInTheDocument();
    expect(screen.getByText(/第 1 \/ 5 关/)).toBeInTheDocument();
    expect(screen.queryByText(/本局派单日期/)).not.toBeInTheDocument();
    click(/第1行第1列/);
    click('领取同一份待办 →');
    expect(screen.queryByRole('heading', { name: '同题挑战 · ' + day })).not.toBeInTheDocument();
    expect(screen.getByText('本局派单日期：' + day + '（UTC+8）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /第1行第1列/ })).toHaveFocus();
    dailyBoard(day).forEach((active, i) => {
      expect(screen.getByRole('button', { name: new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`) })).toHaveAttribute('aria-pressed', String(active));
    });
  } finally {
    window.history.replaceState(null, '', original);
  }
});
