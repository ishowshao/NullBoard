# NullBoard · 清空待办局

**努力工作，直到所有工作都不存在。**

[立即试玩 / Play now](https://ishowshao.github.io/NullBoard/)

NullBoard is now a tiny, static puzzle game about making work disappear. Click a square to toggle it and its orthogonal neighbors. Clear all 16 squares, survive five departments, and become the Chief Nothing Officer. No timer, account, backend, or telemetry.

## 怎么玩

- 点击任意格子，翻转它与上下左右相邻格子；空格也可以点。
- 可开启「演练模式」：先选格查看连锁翻转与待办增减，再「执行这一步」或取消；反复预览不计步，随时可关闭回到直接点击。
- 全部变成「空」即可过关，五关通关可重新入职。
- 可以无限撤销、重开本关，也可点「求助同事」获得一步提示；无计时压力，手机触控和键盘 方向键 / Tab / Enter / 空格均可操作。
- 通关后显示该关最少步数，可重开挑战；提示可用，撤销不计入步数。
- 五关通关后解锁「临时加班」：主动抽取随机可解的 3–4 步小谜题，清空后可再抽新局。重开保留同一份待办，也可随时重新入职回到第一关。
- 五关通关也可选择「全员抄送」番外：点击一次翻转整行和整列，共七格，交点只翻一次。随机题最少 3–4 步，提示和演练会遵循新规则；清空后可继续抽题或换回经典加班。
- 通关后可选择下一份工作量：「轻松摸鱼」最少 3–4 步，或「硬核加班」最少 5–6 步；两种番外都支持，只在抽新题时生效，撤销与同题重开不换题。
- 可在「摸鱼留档处」主动保存一份本机进度，保留关卡、两种番外棋盘、撤销记录、难度和演练开关。刷新仍从第一关开始，点「读取存档」才继续；可随时覆盖或删除。仅保存在此浏览器，不上传、不自动保存，清理浏览器数据会丢失。
- 旧版假工具与虚无证书仍可通过页脚「博物馆」体验，返回时保留本局。

2026-11-02 起每日小步扩展可玩体验，并发布到现有 GitHub Pages。以下保留旧版博物馆说明，运行与贡献命令仍适用。

---

# NullBoard Pro Max

**Zero tasks. Zero pressure. 50% more nothing.**

A tiny, satirical project management app for developers who have had enough project management. Five convincing buttons. Five different ways to accomplish absolutely nothing.

一款完全没有功能的项目管理工具，专为不打算做任何事的开发者而生。五个看起来很有用的按钮，各有一句认真敷衍你的笑话。

## Online demo / 在线试玩

**[Open NullBoard →](https://ishowshao.github.io/NullBoard/)**

No installation or account needed. Try the five different buttons to unlock your Certificate of Nothing.

无需安装或注册，试遍五个不同的按钮即可解锁「虚无证书」。

## Try the joke in 30 seconds / 30 秒看懂这个玩笑

- Create a new task → “Task created in a parallel universe. This one remains beautifully empty.”
- Add tags → Even #nothing is too much commitment.
- Collaborate with team → Perfect alignment on doing nothing. No invitations sent.
- Save your progress → Your imagination is the database.
- ✨ Premium AI Assistant → Zero tokens. Zero tasks. Maximum confidence.

The dark/light switch actually works. So do the keyboard controls: Tab to a button, press Enter or Space, then Escape or “Accept defeat” to dismiss the joke and return to its button. Every control has a visible keyboard-focus outline and a minimum 44px height.

明暗主题切换是真的，键盘操作也是真的。用 Tab 选中按钮，Enter 或空格打开笑话，Escape 或 “Accept defeat” 关闭提示并返回原按钮。

Found a punchline worth sharing? Choose “Copy this joke” to copy it with the NullBoard name and repository link, so friends can find the original joke. Nothing is posted automatically. Prefer to copy by hand? “Copy manually” reveals the full text without requesting clipboard access, even while an earlier copy is still pending. If your browser blocks clipboard access, a read-only text field offers the same complete share text for manual copying. Tab into it to select the text.

看到喜欢的笑点，点击 “Copy this joke” 即可复制带项目名称和仓库链接的文案，方便朋友找到原作，不会自动发布到任何平台；也可直接点击 “Copy manually” 展开文案，无需剪贴板权限，即使自动复制仍在等待也可使用。若浏览器不允许复制，会显示包含项目链接的完整只读文案，可用 Tab 选中后手动复制。

## A small reward for doing nothing / 一无所获也有奖

A small discovery counter shows how many different jokes you have tried. Try all five different buttons to unlock “View Certificate of Nothing”: a shareable souvenir for accomplishing absolutely nothing. Repeated clicks on one button do not count. Open it, copy it if you like, or press Escape to get back to doing nothing. The discovery resets on reload; nothing is saved or sent automatically.

页面会提示已发现的不同笑点数量。试遍五个不同的按钮，即可发现「虚无证书」彩蛋：认真尝试，一事无成。可以打开并主动复制分享；重复点击同一个按钮不算，刷新后重新开始，不存储或自动发送任何数据。

## Run locally / 本地运行

You need Node.js and npm. The current checks were run with Node.js 24 and npm 11.

```sh
git clone https://github.com/ishowshao/NullBoard.git
cd NullBoard/nullboard
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000). The runnable app is inside `nullboard/`, not the repository root. No account, backend, API key, or environment file is needed.

打开本地页面即可体验。注意先进入 `nullboard/` 子目录，无需账号、后端、API key 或环境变量文件。

## What is real? / 哪些是真的？

- React + TypeScript, styled with Tailwind CSS and built with Create React App.
- Five distinct punchlines, dark/light themes, keyboard dismissal and focus restoration.
- Responsive layout, local branded icons, and regression tests.
- No real tasks, tags, team invitations, saved progress, or AI calls. Reloading starts fresh, including the theme.

This is a small frontend joke, not a production task manager or an AI service. “Pro Max” is part of the joke, not a paid plan.

这是一个轻量前端玩笑，不是真正的任务管理或 AI 服务；“Pro Max” 不是收费套餐，刷新后也不会保留进度或主题。

## Check a change / 验证改动

Run these from `nullboard/`:

```sh
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npx eslint src --max-warnings=0
CI=true npm run build
```

Tests cover the actual jokes, repeated interactions, dismissal, focus, themes and branding. Layout changes also need a real-browser check; DOM tests do not verify pixel layout or replace screen-reader testing.

## Keep nothing interesting / 让“什么也不做”更有趣

Start with [the roadmap](nullboard/ROADMAP.md), [contribution guide](CONTRIBUTING.md), and [development notes](nullboard/README.md). Punchlines live in [`features.ts`](nullboard/src/features.ts); their expected behavior lives in [`App.test.tsx`](nullboard/src/App.test.tsx).

Small jokes, clearer presentation, accessibility fixes and reliable tests are welcome. Keep it lightweight: no real task management, accounts, backend, or data collection. If it made you smile, a Star is a nice way to bookmark the joke.

欢迎贡献笑点、展示体验、无障碍改进和测试。保持轻量，不加入真正的任务管理、账号、后端或数据收集。如果它让你笑了，欢迎用 Star 收藏这个玩笑。
