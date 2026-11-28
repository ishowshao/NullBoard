import React, { useEffect, useState } from 'react';
import { dailyDate, previousDailyDates } from './daily';

export default function DailyChallenge({ onStart, headingRef, onBackToBoard, onGoToSave }: {
  onStart: (date: string) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  onBackToBoard?: () => void;
  onGoToSave?: () => void;
}) {
  const [date, setDate] = useState(dailyDate);
  const [selected, setSelected] = useState('');
  const dates = previousDailyDates(date);
  const archiveDate = dates.includes(selected) ? selected : dates[0];
  const archiveIndex = dates.indexOf(archiveDate);
  useEffect(() => {
    const refresh = () => setDate(dailyDate());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return <section className="game-daily" aria-labelledby="daily-title">
    <div><h2 id="daily-title" ref={headingRef} tabIndex={-1}>今日派单 · {date}</h2>
      <p>全公司同一份难题：整行整列翻转，最少 6 步。每天 UTC+8 零点换题，无需先通关。</p>
      <p id="daily-warning">领取会重开当前局，可先在下方保存进度；跨天不会打断正在玩的棋盘。</p></div>
    {onGoToSave && <button className="daily-back" onClick={onGoToSave}>前往本机存档 ↓</button>}
    <button aria-describedby="daily-warning" onClick={() => {
      const current = dailyDate(); setDate(current); onStart(current);
    }}>领取今日全员抄送 →</button>
    {onBackToBoard && <button className="daily-back" onClick={onBackToBoard}>返回当前棋盘 ↑</button>}
    <div className="daily-archive">
      <h3>补班档案 · 过去七天</h3>
      <p>错过的下班机会，可以补办。选日期不换题，领取才会重开当前局；同一日期始终是同一题。</p>
      <label htmlFor="archive-date">派单日期（UTC+8）</label>
      <select id="archive-date" value={archiveDate} onChange={event => setSelected(event.target.value)}>
        {dates.map(day => <option key={day} value={day}>{day}</option>)}
      </select>
      <div className="archive-navigation" role="group" aria-label="逐日翻阅补班档案">
        <button aria-disabled={archiveIndex === dates.length - 1} aria-describedby="archive-selection" onClick={() => {
          if (archiveIndex < dates.length - 1) setSelected(dates[archiveIndex + 1]);
        }}>← 前一天</button>
        <button aria-disabled={archiveIndex === 0} aria-describedby="archive-selection" onClick={() => {
          if (archiveIndex > 0) setSelected(dates[archiveIndex - 1]);
        }}>后一天 →</button>
      </div>
      <p id="archive-selection" role="status" className="archive-selection">待领取：{archiveDate} · 仅翻阅，不换当前局{archiveIndex === 0 ? ' · 已到最新档案' : archiveIndex === dates.length - 1 ? ' · 已到最早档案' : ''}</p>
      <button aria-describedby="daily-warning" onClick={() => {
        // Even after a sleeping tab wakes, launch only the date visible to the player.
        onStart(archiveDate);
      }}>领取 {archiveDate} 的派单 →</button>
    </div>
  </section>;
}
