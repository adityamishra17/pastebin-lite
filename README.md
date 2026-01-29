# Pastebin Lite

A lightweight Pastebin-like application that allows users to create text pastes
and share a link to view them. Pastes can optionally expire based on time (TTL)
or a maximum number of views.

## Live Demo

🚀 Deployed URL:  
https://pastebin-lite-olive-eight.vercel.app/

## Features
- Create a paste with arbitrary text
- Get a shareable URL for each paste
- View pastes via API or browser
- Optional time-based expiry (TTL)
- Optional view-count limits
- Deterministic time handling for automated testing

## Tech Stack
- Next.js (App Router)
- Node.js runtime
- Redis (persistent storage)
- Vercel (deployment)

## Local Development

### Prerequisites
- Node.js 18+
- Redis connection (via Vercel Storage)

### Setup
```bash
npm install
npm run dev
