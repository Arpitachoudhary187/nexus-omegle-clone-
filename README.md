# ⚡ Nexus — Random Video Chat

A production-grade Omegle-like random video chat app built with **React + TypeScript + Socket.IO + WebRTC**.

![Nexus Screenshot](https://placehold.co/1200x630/111118/6c63ff?text=Nexus+Video+Chat)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎥 Video + Audio | Full WebRTC P2P streaming with local preview |
| 💬 Live Text Chat | Real-time chat alongside video |
| ⚡ Instant Matching | Socket.IO waiting queue, auto-paired |
| ⏭ Skip / Next | Find a new stranger instantly |
| 🔇 Mute / Camera Off | Toggle audio & video without disconnecting |
| 💡 Typing Indicator | Debounced "Stranger is typing…" indicator |
| 🌙 Dark / Light Mode | Full theme toggle |
| 📱 Responsive | Mobile PiP layout + full desktop split-screen |
| 🔴 Connection Status | Live status badge (connecting → searching → connected) |

---

## 🗂 Project Structure

```
omegle-clone/
├── server/                  # Node.js Socket.IO signalling server
│   ├── index.js
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ChatBox.tsx          # Scrollable message list + input
│   │   ├── ControlBar.tsx       # Start / Next / Stop / Mute / Camera buttons
│   │   ├── DisconnectedBanner.tsx
│   │   ├── Header.tsx
│   │   ├── LandingOverlay.tsx   # Welcome screen
│   │   ├── StatusBadge.tsx
│   │   └── VideoPanel.tsx       # Single video tile with overlays
│   ├── context/
│   │   └── AppContext.tsx       # Global state + socket wiring
│   ├── hooks/
│   │   ├── useChat.ts           # Message list + typing state
│   │   └── useWebRTC.ts         # Full WebRTC peer connection logic
│   ├── pages/
│   │   └── ChatPage.tsx         # Main layout
│   ├── services/
│   │   └── socket.ts            # Singleton Socket.IO client
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend signalling server
cd server
npm install
cd ..
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit VITE_SOCKET_URL if your server runs on a different port
```

### 3. Start the signalling server

```bash
cd server
node index.js
# → 🚀 Nexus signalling server running on http://localhost:5000
```

### 4. Start the frontend

```bash
# In the project root
npm run dev
# → http://localhost:3000
```

### 5. Test with two browsers

Open **two separate browser windows** (or use incognito) at `http://localhost:3000`.  
Click **Start Chat** in both — they'll be matched automatically.

---

## 🏗 Architecture

```
Browser A                 Signalling Server           Browser B
   │                      (Socket.IO)                    │
   │──── find_match ──────────►│                         │
   │                           │◄──── find_match ────────│
   │◄─── match_found ──────────│──── match_found ───────►│
   │                           │                         │
   │──── webrtc_offer ─────────────────────────────────►│
   │◄─── webrtc_answer ────────────────────────────────── │
   │◄──► ice_candidate ─── (both ways) ────────────────►│
   │                                                      │
   │◄═══════════════ P2P Video/Audio (WebRTC) ══════════►│
   │◄─── send_message ─── (relayed) ──────────────────► │
```

---

## 🔧 WebRTC Flow

1. **Both** clients emit `find_match` → server puts them in a pair
2. **Initiator** calls `createOffer()` → sends offer via `webrtc_offer`
3. **Receiver** calls `handleOffer()` → sends answer via `webrtc_answer`  
4. **Both** exchange ICE candidates via `ice_candidate`
5. P2P video/audio stream established — server is no longer in the media path

---

## 🌐 Deploying to Production

### Backend
```bash
# Railway / Render / Fly.io — just set PORT env var
cd server && npm start
```

### Frontend
```bash
npm run build
# Deploy /dist to Vercel, Netlify, or any static host
# Set VITE_SOCKET_URL to your production server URL
```

### TURN Server (for production)
Add TURN credentials to `src/hooks/useWebRTC.ts` → `ICE_SERVERS`:
```ts
{ urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
```
Without TURN, connections may fail between users on symmetric NATs.

---

## 🛠 Tech Stack

- **React 18** + **TypeScript** — Component model with full type safety
- **Vite** — Lightning-fast dev server and build tool
- **Socket.IO 4** — Real-time bidirectional event relay
- **WebRTC** — Browser-native P2P video/audio (RTCPeerConnection)
- **Tailwind CSS 3** — Utility-first styling with custom design tokens
- **Lucide React** — Clean icon set

---

## 📄 Licence

MIT — use freely, attribution appreciated.
