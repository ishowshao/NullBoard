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

Found a punchline worth sharing? Choose “Copy this joke” to copy it with the NullBoard name and repository link, so friends can find the original joke. Nothing is posted automatically. If your browser blocks clipboard access, select the joke and copy it manually.

看到喜欢的笑点，点击 “Copy this joke” 即可复制带项目名称和仓库链接的文案，方便朋友找到原作，不会自动发布到任何平台；若浏览器不允许复制，可选中文案手动复制。

## A small reward for doing nothing / 一无所获也有奖

Try all five different buttons to unlock “View Certificate of Nothing”: a shareable souvenir for accomplishing absolutely nothing. Repeated clicks on one button do not count. Open it, copy it if you like, or press Escape to get back to doing nothing. The discovery resets on reload; nothing is saved or sent automatically.

试遍五个不同的按钮，即可发现「虚无证书」彩蛋：认真尝试，一事无成。可以打开并主动复制分享；重复点击同一个按钮不算，刷新后重新开始，不存储或自动发送任何数据。

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

Start with [the roadmap](nullboard/ROADMAP.md) and [development notes](nullboard/README.md). Punchlines live in [`features.ts`](nullboard/src/features.ts); their expected behavior lives in [`App.test.tsx`](nullboard/src/App.test.tsx).

Small jokes, clearer presentation, accessibility fixes and reliable tests are welcome. Keep it lightweight: no real task management, accounts, backend, or data collection. If it made you smile, a Star is a nice way to bookmark the joke.

欢迎贡献笑点、展示体验、无障碍改进和测试。保持轻量，不加入真正的任务管理、账号、后端或数据收集。如果它让你笑了，欢迎用 Star 收藏这个玩笑。
