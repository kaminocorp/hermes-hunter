# Hermes Hunter Dashboard — Overview

## What It Is

A real-time monitoring dashboard for the Hermes Hunter autonomous bug bounty system. Deployed on Vercel as a frontend-only Next.js app, it connects to two backend APIs running on Fly.io to display live telemetry from the Overseer (strategic manager) and Hunter (vulnerability discovery worker) agents.

## Tech Stack

| Layer      | Choice                              |
|------------|-------------------------------------|
| Framework  | Next.js 15 (App Router)             |
| Language   | TypeScript                          |
| UI         | React 18, Tailwind CSS              |
| Font       | Share Tech Mono (monospace)          |
| Icons      | Lucide React + custom SVG (`HermesIcon`) |
| Deployment | Vercel (frontend), Fly.io (backends)|

## Architecture

```
 Vercel (this repo)                    Fly.io
┌──────────────────────┐      ┌─────────────────────────┐
│  Next.js Dashboard   │      │  hermes-alpha-hunter     │
│                      │◄─REST┤  /api/status             │
│  useHunterData hooks │◄─SSE─┤  /api/logs/stream        │
│  useOverseerData     │      │  /api/metrics            │
│                      │      │  /api/vulnerabilities    │
│                      │      └─────────────────────────┘
│                      │      ┌─────────────────────────┐
│                      │◄─REST┤  Overseer API (optional) │
│                      │◄─SSE─┤  /overseer/events/stream │
└──────────────────────┘      └─────────────────────────┘
```

**Data flows one way** — the dashboard is read-only. It polls REST endpoints on intervals and subscribes to Server-Sent Events (SSE) for live log/event streams.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (metadata, font)
│   ├── page.tsx            # Single-page dashboard (main UI)
│   └── globals.css         # Brutalist design system
├── components/
│   ├── HermesIcon.tsx      # Custom SVG icon (sword/strike mark)
│   ├── MissionPanel.tsx    # Mission status display
│   ├── StatusBar.tsx       # Top-level status indicators
│   ├── SystemMetrics.tsx   # Footer metrics bar
│   └── TerminalPanel.tsx   # Terminal-style log viewer
├── hooks/
│   ├── useHunterData.ts    # Hunter API hooks (status, metrics, vulns, logs)
│   └── useOverseerData.ts  # Overseer API hooks (status, sessions, events)
└── lib/
    └── api.ts              # API client (fetch wrappers, SSE subscriptions, types)
```

## Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  HEADER: Clock │ Overseer status │ Hunter status │
│           Mission count │ Vulnerability count    │
├────────────────────────┬────────────────────────┤
│                        │                        │
│   Overseer Terminal    │   Hunter Operations    │
│   (merged log stream)  │   ┌──────────────────┐ │
│                        │   │ Active Missions   │ │
│                        │   ├──────────────────┤ │
│                        │   │ Hunter API Status │ │
│                        │   └──────────────────┘ │
├────────────────────────┴────────────────────────┤
│  FOOTER: Workspace │ Success Rate │ API │ Stream │
│          Vulnerabilities │ Alerts                │
└─────────────────────────────────────────────────┘
```

## Data Hooks

All data fetching is encapsulated in custom React hooks with automatic polling:

| Hook                  | Endpoint                     | Interval | Purpose                    |
|-----------------------|------------------------------|----------|----------------------------|
| `useHunterStatus`     | `/api/status`                | 5s       | Online/offline, mission count |
| `useHunterMetrics`    | `/api/metrics`               | 10s      | Performance stats, system info |
| `useVulnerabilities`  | `/api/vulnerabilities`       | 30s      | Discovered vulnerabilities |
| `useHunterLogs`       | `/api/logs/stream` (SSE)     | Live     | Real-time log entries      |
| `useOverseerStatus`   | `/overseer/status`           | 5s       | Overseer connection state  |
| `useOverseerEvents`   | `/overseer/events/stream` (SSE) | Live  | Overseer decisions/actions |

Combined hooks (`useHunterDashboard`, `useOverseerDashboard`) bundle these for convenience.

## Design System

The UI follows a **brutalist aesthetic** — deliberately austere, inspired by military command terminals:

- **No border-radius, no shadows, no glows** — all edges are sharp
- **CRT scanlines** — subtle repeating gradient overlay across the entire viewport
- **Monochrome palette** — grays with three accent colors: green (ok), amber (warn), red (alert)
- **Segmented progress bars** — vertical slits give a mechanical/industrial feel
- **Corner accents** — L-shaped bracket marks on section headers
- **Blinking cursor** — step-function animation (not smooth) for terminal authenticity

## Configuration

Environment variables (see `.env.example`):

| Variable                        | Default                              | Required |
|---------------------------------|--------------------------------------|----------|
| `NEXT_PUBLIC_HUNTER_API_URL`    | `https://hermes-alpha-hunter.fly.dev`| Yes      |
| `NEXT_PUBLIC_OVERSEER_API_URL`  | —                                    | No       |
| `NEXT_PUBLIC_HUNTER_API_TOKEN`  | —                                    | No       |

The Overseer API is optional — the dashboard degrades gracefully when it's unavailable.

## Current Status

In development. The UI is functional and connects to live APIs, but displays placeholder content when backends are offline. The `dashboard/` subdirectory contains an unused Next.js scaffold from initial bootstrapping.
