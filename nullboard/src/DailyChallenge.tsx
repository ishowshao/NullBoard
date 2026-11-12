import React, { useEffect, useState } from 'react';
import { dailyDate } from './daily';

export default function DailyChallenge({ onStart }: { onStart: (date: string) => void }) {
  const [date, setDate] = useState(dailyDate);
  useEffect(() => {
    const refresh = () => setDate(dailyDate());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return <section className="game-daily" aria-labelledby="daily-title">
    <div><h2 id="daily-title">今日派单 · {date}</h2>
      <p>全公司同一份难题：整行整列翻转，最少 5–6 步。每天 UTC+8 零点换题，无需先通关。</p>
      <p id="daily-warning">领取会重开当前局，可先在下方保存进度；跨天不会打断正在玩的棋盘。</p></div>
    <button aria-describedby="daily-warning" onClick={() => {
      const current = dailyDate(); setDate(current); onStart(current);
    }}>领取今日全员抄送 →</button>
  </section>;
}
