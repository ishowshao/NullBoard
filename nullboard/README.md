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

- `src/features.ts`: the five fake features, their distinct punchlines and the Certificate of Nothing souvenir. See the [contribution guide](../CONTRIBUTING.md) before changing IDs or adding entries.
- `src/features.test.ts`: unique slug IDs, separate certificate, and distinct non-empty labels and punchlines.
- `src/App.tsx`: layout, session-only discovery of the five jokes, theme state, live feedback and keyboard dismissal.
- `src/CopyJoke.tsx`: user-triggered clipboard sharing with success feedback and a labeled, read-only full-text fallback. “Copy manually” exposes that text without clipboard permission or waiting for a pending request; a late clipboard result does not remove explicitly requested text. The parent keys this component by feature ID so a pending copy cannot update a different joke.
- `src/App.test.tsx`: interaction and accessible-control regression coverage.
- `src/Achievement.test.tsx`: distinct-feature discovery and visible progress, certificate keyboard controls, reset on remount and opt-in copying.
- `src/CopyJoke.test.tsx`: clipboard success, rejection, missing API, full-text manual selection, retry, keyboard activation and stale asynchronous results.
- `src/branding.test.ts`: metadata, manifest and local icon checks.
- `public/`: browser metadata and branded icons.

Keep the joke intentional. Buttons must not create real tasks, send invitations, call an AI service, or save progress. Preserve the persistent status region, Escape dismissal and focus restoration when changing feedback. Each feature button exposes whether its joke is open with `aria-expanded` and points to the shared status region with `aria-controls`; keep that target mounted and its ID unique per app instance.

For presentation changes, check narrow screens, enlarged text, both themes, keyboard focus, repeated clicks and dismissal in a browser. Jest's DOM environment cannot validate actual geometry, touch input, or screen-reader announcements.

## GitHub Pages demo deployment

The separate `Deploy GitHub Pages demo` workflow builds this directory with Node.js 24, runs tests, TypeScript and ESLint, and uploads only `nullboard/build`. Pull requests validate the build; pushes to `main` deploy it with the official Pages actions. It can also be run manually from Actions.

One-time repository setup: Settings → Pages → Build and deployment → Source → **GitHub Actions**. The repository About website can be set to https://ishowshao.github.io/NullBoard/.

The workflow sets CRA's `PUBLIC_URL` to `/<repository name>` (here `/NullBoard`), so JS, CSS and `%PUBLIC_URL%` icons load under the project path. Manifest icons and `start_url` are already relative. Local `npm start` stays at `/`; no `gh-pages` branch, backend, credentials or paid service is needed. If a custom domain is introduced, update `PUBLIC_URL` for its base path.

To reproduce the production build locally:

```sh
PUBLIC_URL=/NullBoard CI=true npm run build
```

Serve the output mounted at `/NullBoard/`, then check both themes, all five buttons, the unlocked certificate and its copy button. A successful build alone does not establish that Pages is enabled or the live demo is working.

This deployment is separately authorized infrastructure work, not a daily feature increment. Revert the deployment commit to remove the workflow; disable Pages in repository settings to unpublish the site.
