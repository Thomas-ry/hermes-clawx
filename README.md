# Hermes ClawX

`Hermes ClawX` is a desktop client for `Hermes Agent`.

It packages a local Hermes runtime behind an Electron application and exposes the workflows that matter in daily use: chat, cron jobs, skills, channel configuration, runtime settings, logs, packaging, and update delivery.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Build](https://github.com/Thomas-ry/hermes-clawx/actions/workflows/build.yml/badge.svg)](https://github.com/Thomas-ry/hermes-clawx/actions/workflows/build.yml)

## Overview

Most desktop wrappers for agent runtimes stop at “open a window around a local server”.

`Hermes ClawX` takes a different approach:

- It treats `Hermes Agent` as the product surface, not as a hidden dependency.
- It bundles the runtime so non-CLI users can run Hermes locally with fewer moving parts.
- It gives common Hermes workflows first-class UI entry points instead of pushing everything through raw config files.

This is not a generic Electron shell and it is not intended to impersonate `ClawX`. It is a separate desktop client designed specifically for Hermes-driven work.

## Current Capabilities

- `Dashboard`: runtime status, gateway controls, auto-update controls, and release feed visibility
- `Chat`: local OpenAI-compatible Hermes workbench with provider selection, tool presets, reserved endpoint inventory, and request timeline visualization
- `Memory`: `MEMORY.md` / `USER.md` surfaces, cross-session search reservation, and OpenClaw import planning
- `Cron`: create, inspect, filter, edit, run, pause, resume, and remove cron jobs
- `Skills`: inspect installed skills and enable or disable them per surface
- `Channels`: edit environment-backed channel integrations such as Telegram, Discord, Slack, Signal, WhatsApp, Feishu, WeCom, Email, and Matrix
- `Settings`: 8-tab control center for API connection, 12+ providers, 40+ tools, MCP, terminal backends, memory/session/cron parameters, and packaging profiles
- `Logs`: stream gateway logs with search, stream filtering, and copyable visible output
- `Packaging`: build macOS, Windows, and Linux desktop artifacts from the same repository, with `docker-compose.yml` and environment doctor reserved for foolproof install flows

## Architecture

At a high level, `Hermes ClawX` is split into three parts:

1. `Electron Main`
   Starts and supervises the bundled Hermes Gateway, owns privileged runtime operations, and keeps secrets out of the renderer process.
2. `Preload + IPC`
   Exposes a narrow desktop API to the renderer for gateway control, config management, cron actions, log streaming, and update state.
3. `React Renderer`
   Implements the desktop UI for Hermes workflows using page-level views for dashboard, chat, memory, cron, skills, channels, settings, and logs.

Runtime requests from the UI are proxied through Electron Main instead of exposing the local Hermes API key directly in the browser context.

### Reserved API Surface

The renderer is organized around Hermes/OpenAI-compatible endpoints that are already mapped into the product model:

- `GET /health`
- `GET /v1/models`
- `POST /v1/chat/completions`
- `GET /v1/toolsets`
- `GET /v1/skills`
- `GET /v1/memory`
- `GET|POST /v1/cronjobs`

## Repository Layout

```text
apps/desktop/          Electron + React desktop application
docker-compose.yml     Containerized runtime starter for install and debugging flows
scripts/               Runtime build, release asset generation, icon generation
.github/workflows/     CI build and release automation
README.md              Project overview and operator documentation
ROADMAP.md             Project direction and non-goals
CONTRIBUTING.md        Contribution workflow
SECURITY.md            Security disclosure guidance
```

## Local Development

### Requirements

- Node.js `22+`
- `pnpm 10+`
- `uv`

### Setup

```bash
pnpm setup
pnpm dev
```

`pnpm setup` is the foolproof bootstrap path. It installs workspace dependencies if needed, runs the environment doctor, prepares the bundled Hermes runtime, and leaves you ready to open the desktop app.

If you want a containerized starter environment for the runtime and dependency installation flow:

```bash
docker compose up -d
```

## Common Commands

```bash
pnpm doctor
pnpm setup
pnpm dev
pnpm lint
pnpm test
pnpm build
pnpm package:mac
pnpm package:win
pnpm package:linux
```

If you attempt to package without building the runtime first, packaging will fail by design.

## Packaging and Distribution

`Hermes ClawX` is set up for desktop packaging across all three major platforms:

- macOS: `dmg` and `zip`
- Windows: `NSIS`
- Linux: `AppImage` and `deb`

Artifacts are emitted under `apps/desktop/release/`.

Icons are generated from `scripts/generate-icons.py` into:

- `apps/desktop/build/icon.png`
- `apps/desktop/build/icon.ico`
- `apps/desktop/build/icon.icns`

## Updates and Releases

The desktop client uses `electron-updater` with a `generic` provider.

Default update feed:

`https://thomas-ry.github.io/hermes-clawx/updates`

Release automation is handled by GitHub Actions:

- `build.yml`
  Runs on `main` pushes and pull requests, builds packages on macOS, Windows, and Linux, and uploads artifacts.
- `release.yml`
  Runs on version tags or manual dispatch, builds packaged artifacts, generates release metadata, deploys the update feed to GitHub Pages, and creates a draft GitHub Release.

To publish a tagged release:

```bash
git tag v0.1.1
git push origin v0.1.1
```

To publish a manual release:

1. Run the `release` workflow in GitHub Actions.
2. Provide a semantic version such as `0.1.1`.
3. Optionally override the upstream Hermes reference.

## Quality Gates

Before opening a pull request, run:

```bash
pnpm lint
pnpm test
pnpm build
```

If your change touches packaging, auto-update behavior, or runtime bundling, document what you validated and what you did not validate in the PR description.

## Security Notes

Before publishing code or release artifacts, verify:

- no `.env`, token, key, or local-machine path has been committed accidentally
- generated release artifacts and runtime caches remain ignored where appropriate
- screenshots, logs, and README examples do not expose credentials or private infrastructure details

Please report security issues through the process documented in [SECURITY.md](./SECURITY.md).

## Open Source Project Files

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)
- [ROADMAP.md](./ROADMAP.md)
- [LICENSE](./LICENSE)

## Roadmap

Near-term work is focused on:

- stronger onboarding for first-time desktop users
- better visualization of Hermes runtime state and recovery paths
- richer Chat, Cron, and Skills workflows
- more polished public release and update operations

Longer-term intent and non-goals are documented in [ROADMAP.md](./ROADMAP.md).
