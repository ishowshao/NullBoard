# Developing NullBoard

This directory contains the runnable React + TypeScript app. See the [project overview](../README.md) for the premise and quick start, and the [roadmap](ROADMAP.md) for the next small improvements.

## Commands

Run from this directory (`NullBoard/nullboard`):

```sh
npm ci
npm start
```

The development server opens at http://localhost:3000. No backend, account, API key, or `.env` file is required.

Before submitting a change:

```sh
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npx eslint src --max-warnings=0
CI=true npm run build
```

`npm test` without flags starts interactive watch mode. `npm run build` creates a production bundle in `build/`; it does not deploy it.

## Where to edit

- `src/features.ts`: the five fake features and their distinct punchlines.
- `src/App.tsx`: layout, theme state, live feedback and keyboard dismissal.
- `src/CopyJoke.tsx`: user-triggered clipboard sharing with success and manual-copy fallback feedback. The parent keys this component by feature ID so a pending copy cannot update a different joke.
- `src/App.test.tsx`: interaction and accessible-control regression coverage.
- `src/CopyJoke.test.tsx`: clipboard success, rejection, missing API, retry, keyboard activation and stale asynchronous results.
- `src/branding.test.ts`: metadata, manifest and local icon checks.
- `public/`: browser metadata and branded icons.

Keep the joke intentional. Buttons must not create real tasks, send invitations, call an AI service, or save progress. Preserve the persistent status region, Escape dismissal and focus restoration when changing feedback. Each feature button exposes whether its joke is open with `aria-expanded` and points to the shared status region with `aria-controls`; keep that target mounted and its ID unique per app instance.

For presentation changes, check narrow screens, enlarged text, both themes, keyboard focus, repeated clicks and dismissal in a browser. Jest's DOM environment cannot validate actual geometry, touch input, or screen-reader announcements.
