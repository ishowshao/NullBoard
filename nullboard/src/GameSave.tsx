import React, { useEffect, useRef, useState } from 'react';
import { levels } from './game';
import { GameSnapshot, readSave, SAVE_KEY, writeSave } from './gameSave';

function storedGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return { snapshot: readSave(raw), present: raw !== null };
}

export default function GameSave({ game, onRestore }: { game: GameSnapshot; onRestore: (game: GameSnapshot) => void }) {
  const [saved, setSaved] = useState(() => {
    try { return { ...storedGame(), unavailable: false }; }
    catch { return { snapshot: null, present: false, unavailable: true }; }
  });
  const [message, setMessage] = useState('');
  const saveButton = useRef<HTMLButtonElement | null>(null);
  const readButton = useRef<HTMLButtonElement | null>(null);
  const deleteButton = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    function refresh(event: Event) {
      if (event instanceof StorageEvent && event.key !== SAVE_KEY && event.key !== null) return;
      try {
        const current = storedGame();
        if ((!current.snapshot && document.activeElement === readButton.current) ||
          (!current.present && document.activeElement === deleteButton.current)) saveButton.current?.focus();
        setSaved({ ...current, unavailable: false });
        setMessage('');
      } catch { /* Leave the last known checkpoint visible; explicit actions report failures. */ }
    }
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh); };
  }, []);
  function save() {
    try {
      const raw = writeSave(game);
      localStorage.setItem(SAVE_KEY, raw);
      setSaved({ snapshot: readSave(raw), present: true, unavailable: false });
      setMessage('已保存当前局和撤销记录。之后的操作不会自动保存。');
    } catch { setMessage('保存失败：浏览器存储不可用、空间不足或记录过长。当前游戏未受影响。'); }
  }
  function restore() {
    try {
      // Re-read on use: another tab may have replaced or deleted the checkpoint.
      const current = storedGame();
      setSaved({ ...current, unavailable: false });
      if (current.snapshot) { onRestore(current.snapshot); setMessage('已读取存档，可继续操作或撤销；演练预览和提示已清除。'); }
      else { setMessage('没有可读取的有效存档。当前游戏未改变。'); saveButton.current?.focus(); }
    } catch { setMessage('读取失败，当前游戏未改变。'); }
  }
  function remove() {
    try {
      localStorage.removeItem(SAVE_KEY);
      setSaved({ snapshot: null, present: false, unavailable: false });
      setMessage('已删除本机存档，当前游戏继续保留。');
      saveButton.current?.focus();
    } catch { setMessage('删除失败，存档和当前游戏未改变。'); }
  }
  const snapshot = saved.snapshot;
  const label = snapshot ? (snapshot.overtime ? (snapshot.copyAll ? '全员抄送' : '临时加班') : `第 ${snapshot.level + 1} 关 · ${levels[snapshot.level].name}`) : '';
  return <section className="game-save" aria-label="本机存档">
    <h2>摸鱼留档处</h2>
    <p>仅点保存才会在此浏览器存一份进度，含棋盘与撤销记录。不上传、不自动保存；清理浏览器数据会丢失。读取会替换当前局。</p>
    <p>{snapshot ? `已有存档：${label}，已操作 ${snapshot.history.length} 次。` : saved.present ? '存档损坏或版本不兼容，可删除或覆盖；不会影响当前游戏。' : saved.unavailable ? '本机存档暂不可用，游戏仍可继续。' : '还没有本机存档。'}</p>
    <div className="save-actions"><button ref={saveButton} onClick={save}>{saved.present ? '覆盖存档为当前局' : '保存当前局'}</button>{snapshot && <button ref={readButton} onClick={restore}>读取存档（替换当前局）</button>}{saved.present && <button ref={deleteButton} onClick={remove}>删除本机存档</button>}</div>
    <p role="status" aria-atomic="true">{message}</p>
  </section>;
}
