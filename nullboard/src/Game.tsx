import React, { useEffect, useRef, useState } from 'react';
import App from './App';
import { adjacentCell, copyAllRules, initialBoard, levels, overtimeBoard, SIZE, standardRules } from './game';
import './game.css';

export default function Game() {
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const [museum, setMuseum] = useState(false);
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState(() => initialBoard(0));
  const [hint, setHint] = useState<number | null>(null);
  const [history, setHistory] = useState<boolean[][]>([]);
  const [overtime, setOvertime] = useState<boolean[] | null>(null);
  const [copyAll, setCopyAll] = useState(false);
  const [rehearsing, setRehearsing] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const focusBoard = useRef(false);
  const result = useRef<HTMLDivElement | null>(null);
  const focusResult = useRef(false);
  const remaining = board.filter(Boolean).length;
  const won = remaining === 0;
  const final = level === levels.length - 1;
  const rules = copyAll ? copyAllRules : standardRules;
  const influence = copyAll ? '整行和整列（交点只翻一次）' : '它和上下左右的格子';
  const optimal = rules.solve(overtime ?? initialBoard(level))?.length;
  const previewBoard = preview === null ? null : rules.toggle(board, preview);
  useEffect(() => {
    if (focusBoard.current) { cells.current[0]?.focus(); focusBoard.current = false; }
    if (focusResult.current) { result.current?.focus(); focusResult.current = false; }
  }, [board]);
  function resetBoard(nextBoard: boolean[]) {
    setBoard(nextBoard); setHistory([]); setHint(null); setPreview(null); focusBoard.current = true;
  }
  function play(index: number) {
    setHistory([...history, board]); setBoard(rules.toggle(board, index)); setHint(null); setPreview(null);
  }
  function restart(next = level) {
    setLevel(next); setOvertime(null); setCopyAll(false); resetBoard(initialBoard(next));
  }
  function drawOvertime(nextCopyAll: boolean) {
    const next = overtimeBoard(overtime, Math.random, nextCopyAll ? copyAllRules : standardRules);
    setCopyAll(nextCopyAll); setOvertime(next); resetBoard(next);
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
            <div className="game-board-top"><span>{overtime ? (copyAll ? '番外 · 全员抄送' : '番外 · 临时加班') : `第 ${level + 1} / ${levels.length} 关 · ${levels[level].name}`}</span><span>剩余 <strong>{remaining}</strong></span></div>
            <p id="board-help" className="game-rule">{rehearsing ? `演练中：点击格子预览${influence}的翻转，选好后按「执行这一步」。方向键移动，空格或回车选择演练位置。` : `点击任意格子，翻转${influence}。让所有格子变成「空」，即可下班。键盘方向键移动，空格或回车翻转。`}</p>
            <div className="task-grid" aria-describedby="board-help rehearsal-help">
              {board.map((active, index) => {
                const changes = previewBoard !== null && previewBoard[index] !== active;
                return <button key={index} ref={el => { cells.current[index] = el; }} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); cells.current[adjacentCell(index, event.key)]?.focus(); } }} className={`task-cell ${active ? 'task-active' : ''} ${hint === index ? 'task-hint' : ''} ${changes ? 'task-preview' : ''} ${preview === index ? 'task-preview-origin' : ''}`} aria-label={`第${Math.floor(index / SIZE) + 1}行第${index % SIZE + 1}列：${active ? '待办' : '空'}${hint === index ? '，建议点击' : ''}${changes ? `，演练后：${active ? '空' : '待办'}` : ''}${preview === index ? '，演练起点' : ''}`} aria-pressed={active} disabled={won} onClick={() => { if (rehearsing) { setPreview(index); setHint(null); } else play(index); }}><span aria-hidden="true">{preview === index ? '◎' : active ? '▣' : '·'}</span><small>{changes ? (active ? '待办→空' : '空→待办') : active ? '待办' : '空'}</small></button>;
              })}
            </div>
            <div className="game-controls"><span>已操作 <strong>{history.length}</strong> 次</span><button disabled={!history.length} onClick={() => { setBoard(history[history.length - 1]); setHistory(history.slice(0, -1)); setHint(null); setPreview(null); }}>撤销</button><button disabled={won} onClick={() => { setHint(rules.solve(board)?.[0] ?? null); setPreview(null); }}>求助同事</button><button onClick={() => resetBoard((overtime ?? initialBoard(level)).slice())}>重开本关</button></div>
            <p className="hint-message" role="status">{hint !== null ? `同事建议：点击第 ${Math.floor(hint / SIZE) + 1} 行第 ${hint % SIZE + 1} 列。` : '卡住了？可以请同事指点一步。'}</p>
            <div className="game-rehearsal">
              <button aria-pressed={rehearsing} disabled={won} onClick={() => { setRehearsing(!rehearsing); setPreview(null); setHint(null); }}>演练模式</button>
              <p id="rehearsal-help">{rehearsing ? '先选一个格子，看清连锁反应，再决定是否执行。预览不计步。' : '怕越忙越乱？开启演练，先看一步会发生什么。'}</p>
              <p className="rehearsal-status" role="status" aria-atomic="true">{previewBoard && preview !== null ? `演练第 ${Math.floor(preview / SIZE) + 1} 行第 ${preview % SIZE + 1} 列：待办 ${remaining} → ${previewBoard.filter(Boolean).length} 项。${previewBoard.some(Boolean) ? '这只是预览，待办尚未改变。' : '执行这一步即可下班！'}` : rehearsing && !won ? '点击棋盘选一步，◎ 标记演练起点。' : ''}</p>
              {rehearsing && !won && <div className="rehearsal-actions"><button disabled={preview === null} onClick={() => { if (preview !== null) { const index = preview; focusResult.current = !previewBoard?.some(Boolean); play(index); if (!focusResult.current) cells.current[index]?.focus(); } }}>执行这一步</button><button disabled={preview === null} onClick={() => { const index = preview; setPreview(null); if (index !== null) cells.current[index]?.focus(); }}>取消演练</button></div>}
            </div>
          </section>
          <aside className="game-notes">
            <div className="game-stamp" aria-hidden="true">{won ? '准予下班' : '正在假装忙碌'}</div>
            <h2>今日工作指示</h2><p>{overtime ? (copyAll ? '回复一人，抄送全行全列。七个同事一起忙，也能一起消失。规则已改变，每份都可解，最少 3–4 步。' : '本来可以下班了。你自愿抽了一份随机待办，办公室对此深表遗憾。每份都可解，最少 3–4 步。') : levels[level].memo}</p>
            <ul><li>亮格是待办，暗格是虚无。</li><li>{copyAll ? '空格也能点，一次翻转七格。' : '空格也能点，邻居也会变。'}</li><li>无倒计时，可无限撤销。</li></ul>
            <div ref={result} tabIndex={-1} className="game-result" role="status" aria-atomic="true">{won ? (overtime ? `${copyAll ? '全员抄送' : '临时待办'}已清空！${history.length} 次操作后，你再次获得了下班资格。` : final ? `全部 ${levels.length} 关通关！你用 ${history.length} 次操作完成最后一关。获封「首席虚无官」。` : `本关已清空！你用 ${history.length} 次操作，成功创造了零价值。`) : `还有 ${remaining} 项待办。真实产出：始终为 0。`}</div>
            {won && optimal !== undefined && <p className="game-score" role="status">{history.length === optimal ? `完美摸鱼：${optimal} 步，已达到本关最少步数！` : `本关最少 ${optimal} 步，你用了 ${history.length} 步。重开试试更快下班？`} 提示可用，撤销不计入步数。</p>}
            {won && final && <button className="game-next" onClick={() => drawOvertime(false)}>{overtime && !copyAll ? '再抽一份临时待办' : '抽一份临时待办'} →</button>}
            {won && final && <button className="game-return" onClick={() => drawOvertime(true)}>{copyAll ? '再抽一份全员抄送' : '挑战全员抄送：整行整列翻转'} →</button>}
            {(won || overtime) && <button className={overtime ? 'game-return' : 'game-next'} onClick={() => restart(final ? 0 : level + 1)}>{final ? '重新入职' : '下一关：更多无用之事'} →</button>}
          </aside>
        </div>
        <footer className="game-footer"><p>不保存、不上传、不产生绩效。刷新从第一关开始。</p><button onClick={() => setMuseum(true)}>参观旧版无用工具博物馆 →</button><span>v0.8 · 2026.11.09</span></footer>
      </div>
    </main>
  );
}
