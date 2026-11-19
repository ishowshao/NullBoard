import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game';
import { dailyBoard } from './daily';
import { copyAllRules } from './game';

test('dated puzzles keep their own best until reload and slower replays do not overwrite it', () => {
  const view = render(<Game />);
  const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
  const record = () => screen.queryByText(/本次打开页面的同题纪录/);
  const select = screen.getByLabelText<HTMLSelectElement>('派单日期（UTC+8）');
  const day = select.value;
  const start = () => click(new RegExp('领取 ' + day));
  const cell = (i: number) => click(new RegExp(`第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列`));
  const moves = copyAllRules.solve(dailyBoard(day))!;
  const extra = Array.from({ length: 16 }, (_, i) => i).find(i => !moves.includes(i))!;
  const fast = () => moves.forEach(cell);
  const slow = () => { cell(extra); cell(extra); fast(); };

  start();
  expect(record()).not.toBeInTheDocument();
  slow();
  expect(record()).toHaveTextContent(`${moves.length + 2} 步`);
  click('重开本关');
  expect(record()).toHaveTextContent(`${moves.length + 2} 步`);
  fast();
  expect(record()).toHaveTextContent(`${moves.length} 步`);
  click('重开本关');
  slow();
  expect(record()).toHaveTextContent(`${moves.length} 步。这次比纪录多 2 步`);
  click('← 前一天');
  expect(record()).toHaveTextContent(`${moves.length} 步`);
  click(new RegExp('领取 ' + select.value));
  expect(record()).not.toBeInTheDocument();
  click('后一天 →');
  start();
  expect(record()).toHaveTextContent(`${moves.length} 步`);
  view.unmount();

  render(<Game />);
  start();
  expect(record()).not.toBeInTheDocument();
});
