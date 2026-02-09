# RunPod GPU Pod Admin Manager — Implementation Plan

## Overview
Build a fullstack React + Node.js admin tool for managing RunPod GPU instances.
- **Frontend**: React (Vite) + Tailwind CSS + Lucide React + xterm.js
- **Backend**: Node.js (Express) + Socket.io + ssh2
- **State**: TanStack Query (React Query)

---

## Phase 1: Project Scaffolding
1. Create Vite React project (frontend)
2. Create Node.js Express backend (server/)
3. Install all dependencies for both
4. Configure Tailwind CSS
5. Set up project folder structure per spec

## Phase 2: Backend (Node.js Proxy Server)
1. **server/server.js** — Express + Socket.io init, CORS config
2. **server/services/runpodApi.js** — RunPod GraphQL proxy (getPods, stopPod, startPod, resumePod, createPod, terminatePod), API key management from env
3. **server/services/sshService.js** — SSH2 client, log streaming (tail -f), resource monitoring (docker stats), WebSocket-SSH bridge for xterm.js
4. **server/.env** — RUNPOD_API_KEY placeholder

## Phase 3: Frontend — Core Layout & Routing
1. **src/App.jsx** — Main layout with header bar (logo, total usage, API status, settings button)
2. **src/components/layout/Header.jsx** — Top bar component
3. Modal system for Settings and Deploy wizard

## Phase 4: Frontend — Dashboard (Main Screen)
1. **src/components/dashboard/Dashboard.jsx** — Main pod grid view
2. **src/components/dashboard/PodCard.jsx** — Individual pod card (RUNNING/STOPPED states, GPU info, CPU/MEM, cost, action buttons)
3. **src/components/dashboard/EmptySlot.jsx** — Empty slot "Click to Deploy" card
4. **src/hooks/usePods.js** — TanStack Query hook for fetching pods with polling

## Phase 5: Frontend — Log Viewer
1. **src/components/terminal/LogViewer.jsx** — Real-time log streaming panel with autoscroll, search, clear, download
2. **src/components/terminal/ResourceBar.jsx** — CPU/MEM/Disk status bar
3. **src/hooks/useLogs.js** — Socket.io hook for log streaming
4. **src/hooks/useSocket.js** — Shared Socket.io connection hook

## Phase 6: Frontend — SSH Terminal (xterm.js)
1. **src/components/terminal/Terminal.jsx** — xterm.js integration with WebSocket-SSH bridge
2. PTY resize event handling

## Phase 7: Frontend — Quick Deploy Wizard
1. **src/components/deploy/DeployModal.jsx** — Modal with pod name, template select, GPU select, volume size, estimated cost, deploy button

## Phase 8: Frontend — Settings Modal
1. **src/components/settings/SettingsModal.jsx** — API key input (masked), polling interval, default region, test connection, save

## Phase 9: Error Handling & Polish
1. Toast notifications (GPU out of stock, connection errors)
2. SSH connection retry logic with "Connecting..." state
3. Log scrollback limit for memory management
