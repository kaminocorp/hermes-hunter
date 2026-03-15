# Hermes Hunter Dashboard

A real-time dashboard for monitoring AI-powered bug bounty hunting operations.

## Features

- **Live Terminal Feeds** - Real-time monitoring of both Overseer and Hunter agent operations
- **Mission Control** - Track active vulnerability discovery missions with progress indicators
- **System Metrics** - Monitor resource usage and system health
- **Professional UI** - Clean, terminal-inspired interface with smooth animations

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deployment

This dashboard is designed to be deployed on Vercel as a frontend-only application. It will connect to the Hermes Alpha system APIs for real-time data.

## Architecture

The dashboard displays data from:
- **Overseer Agent** - Strategic management and Hunter deployment
- **Hunter Agent** - Active vulnerability discovery and analysis
- **System APIs** - Health metrics and operational data

## Status

🚧 **In Development** - Initial version with mock data for UI testing.