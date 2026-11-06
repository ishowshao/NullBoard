import React, { useRef, useState } from 'react';
import App from './App';
import { adjacentCell, initialBoard, levels, SIZE, solve, toggle } from './game';
import './game.css';

export default function Game() {
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const [museum, setMuseum] = useState(false);
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState(() => initialBoard(0));
  const [hint, setHint] = useState<number | null>(null);
  const [history, setHistory] = useState<boolean[][]>([]);
  const remaining = board.filter(Boolean).length;
  const won = remaining === 0;
  const final = level === levels.length - 1;
  const optimal = solve(initialBoard(level))?.length;
  function restart(next = level) {
    setLevel(next); setBoard(initialBoard(next)); setHistory([]); setHint(null);
  }
  if (museum) return <><div className="museum-return"><button onClick={() => setMuseum(false)}>← 返回清空待办局 · 保留本局</button></div><App /></>;
  return (
    <main className="null-game">
      <div className="game-wrap">
        <header className="game-header"><a href="https://github.com/ishowshao/NullBoard" target="_blank" rel="noopener noreferrer">NULLBOARD ↗ <span className="sr-only">GitHub 源码，新标签页打开</span></a><span>实验 001 / 静态但不无聊</span></header>
        <section className="game-intro" aria-labelledby="game-title">
          <p className="game-eyebrow">DEPARTMENT OF NOTHING</p>
          <h1 id="game-title">清空<span>待办局</span><i aria-hidden="true">∅</i></h1>
          <p className="game-subtitle">努力工作，直到所有工作都不存在。</p>
        </section>
        <div className="game-layout">
          <section className="game-board-panel" aria-label="待办棋盘">
            <div className="game-board-top"><span>第 {level + 1} / {levels.length} 关 · {levels[level].name}</span><span>剩余 <strong>{remaining}</strong></span></div>
            <p id="board-help" className="game-rule">点击任意格子，翻转它和上下左右的格子。让所有格子变成「空」，即可下班。键盘方向键移动，空格或回车翻转。</p>
            <div className="task-grid" aria-describedby="board-help">
              {board.map((active, index) => <button key={index} ref={el => { cells.current[index] = el; }} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); cells.current[adjacentCell(index, event.key)]?.focus(); } }} className={`task-cell ${active ? 'task-active' : ''} ${hint === index ? 'task-hint' : ''}`} aria-label={`第${Math.floor(index / SIZE) + 1}行第${index % SIZE + 1}列：${active ? '待办' : '空'}${hint === index ? '，建议点击' : ''}`} aria-pressed={active} disabled={won} onClick={() => { setHistory([...history, board]); setBoard(toggle(board, index)); setHint(null); }}><span aria-hidden="true">{active ? '▣' : '·'}</span><small>{active ? '待办' : '空'}</small></button>)}
            </div>
            <div className="game-controls"><span>已操作 <strong>{history.length}</strong> 次</span><button disabled={!history.length} onClick={() => { setBoard(history[history.length - 1]); setHistory(history.slice(0, -1)); setHint(null); }}>撤销</button><button disabled={won} onClick={() => setHint(solve(board)?.[0] ?? null)}>求助同事</button><button onClick={() => restart()}>重开本关</button></div>
            <p className="hint-message" role="status">{hint !== null ? `同事建议：点击第 ${Math.floor(hint / SIZE) + 1} 行第 ${hint % SIZE + 1} 列。` : '卡住了？可以请同事指点一步。'}</p>
          </section>
          <aside className="game-notes">
            <div className="game-stamp" aria-hidden="true">{won ? '准予下班' : '正在假装忙碌'}</div>
            <h2>今日工作指示</h2><p>{levels[level].memo}</p>
            <ul><li>亮格是待办，暗格是虚无。</li><li>空格也能点，邻居也会变。</li><li>无倒计时，可无限撤销。</li></ul>
            <div className="game-result" role="status" aria-atomic="true">{won ? (final ? `全部 ${levels.length} 关通关！你用 ${history.length} 次操作完成最后一关。获封「首席虚无官」。` : `本关已清空！你用 ${history.length} 次操作，成功创造了零价值。`) : `还有 ${remaining} 项待办。真实产出：始终为 0。`}</div>
            {won && optimal !== undefined && <p className="game-score" role="status">{history.length === optimal ? `完美摸鱼：${optimal} 步，已达到本关最少步数！` : `本关最少 ${optimal} 步，你用了 ${history.length} 步。重开试试更快下班？`} 提示可用，撤销不计入步数。</p>}
            {won && <button className="game-next" onClick={() => restart(final ? 0 : level + 1)}>{final ? '重新入职' : '下一关：更多无用之事'} →</button>}
          </aside>
        </div>
        <footer className="game-footer"><p>不保存、不上传、不产生绩效。刷新从第一关开始。</p><button onClick={() => setMuseum(true)}>参观旧版无用工具博物馆 →</button><span>v0.5 · 2026.11.06</span></footer>
      </div>
    </main>
  );
}
