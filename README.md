# clawT

Hermes Agent 的桌面可视化客户端，目标是做成 “Hermes 版 ClawX”。

当前已经具备：
- Electron Main 托管 bundled Hermes Gateway
- Chat / Cron / Skills / Channels / Settings / Logs 页面
- 三平台打包脚手架
- 私有仓库 CI 构建工作流

## 开发（本机）

前置：
- Node.js 22+
- pnpm 10+
- `uv`（用于构建内置 Hermes runtime）

```bash
pnpm install

# 构建“电池内置”的 Hermes runtime（会下载/安装 Python 3.11 依赖，体积较大）
pnpm runtime:build

# 启动桌面端（开发模式）
pnpm dev
```

## 打包（本机）

```bash
pnpm runtime:build
pnpm package:mac     # 或 package:win / package:linux
```

如果没有先执行 `pnpm runtime:build`，打包命令会直接失败并提示缺少 bundled runtime。

## CI 打包

GitHub Actions 工作流会：
- 安装 Node + pnpm + uv
- 构建 bundled Hermes runtime
- 按平台打包 `macOS / Windows / Linux`
- 上传 `apps/desktop/release/**` 产物

你也可以在 Actions 页面手动触发，并覆盖 Hermes 上游 commit/tag。

## 运行时说明

- Hermes Gateway 由 Electron Main 进程托管（自动启动/重启），并启用本机 OpenAI 兼容 API server。
- UI 通过 Main 进程代理访问 `http://127.0.0.1:<port>/v1/...`，避免在渲染进程暴露 `API_SERVER_KEY`。
