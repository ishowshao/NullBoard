# Contribute a little more nothing

NullBoard is a small frontend joke, not an unfinished task manager. Useful contributions make the joke clearer, more accessible, easier to share, or harder to break. No accounts, backend, real tasks, AI calls, or data collection.

## Change a joke

1. Start with `nullboard/ROADMAP.md` and the latest `main`. Keep one independently useful change small; preserve unrelated work.
2. Edit `nullboard/src/features.ts`. A feature has an `id`, button `label`, and `message`; `premium` only changes its styling.
3. Keep existing IDs stable. New IDs must be unique lowercase words joined by hyphens, including across the certificate entry. IDs drive React component identity and discovery counting: duplicates can count two buttons as one or retain another joke's copy state.
4. Give each entry a non-empty, distinct label and punchline. Keep `zeroAchievement` separate from the `features` list: the reward must not count toward unlocking itself.
5. Update behavior tests and any affected README examples or button counts. The feature count in the discovery UI is derived from the list, but the certificate text and documentation may still mention five buttons. Review them deliberately if changing the number of features.

`nullboard/src/features.test.ts` checks the data contract. It complements, rather than replaces, interaction tests in `App.test.tsx` and `Achievement.test.tsx`.

## Verify before submitting

From `nullboard/`:

```sh
npm ci
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npx eslint src --max-warnings=0
PUBLIC_URL=/NullBoard CI=true npm run build
```

For a UI change, also check both themes, a 320px-wide viewport, enlarged text, keyboard activation and Escape, repeated clicks, changing jokes, and the certificate. Check manual sharing as well as automatic copying. DOM tests cannot verify layout or real clipboard permissions. Report checks you could not run instead of calling them passed.

Describe what changed and why, include the checks run, and link screenshots for visual changes when available. Don't publish, deploy, add credentials, or change repository settings as a side effect of a small contribution.

## 中文简版

先读路线，每次只做一个有用的小改动。笑点集中在 `nullboard/src/features.ts`：ID 必须稳定且唯一，证书不加入待探索功能列表，标签和文案不能留空或重复。改变按钮数量时同时检查证书文案、README 与交互测试。完成上面的自动检查；界面改动还需真实浏览器验收，未运行的检查如实说明。保持项目轻量，不加入真正的任务管理、账号或数据收集。
