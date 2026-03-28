/**
 * Nexus — Socket.IO Signalling Server
 * ─────────────────────────────────────
 * Handles:
 *  • Random user matching (waiting queue)
 *  • WebRTC offer/answer/ICE relay
 *  • Text chat relay
 *  • Typing indicator relay
 *  • Skip / disconnect cleanup
 *
 * Run:  node server/index.js
 * Requires: npm install express socket.io cors
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// ── State ─────────────────────────────────────────────────────────────────────

/** Queue of socket IDs waiting for a match */
const waitingQueue = [];

/** Map: socketId → partnerId  (both directions) */
const pairs = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function removeFromQueue(socketId) {
  const idx = waitingQueue.indexOf(socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
}

function unpair(socketId) {
  const partnerId = pairs.get(socketId);
  if (partnerId) {
    pairs.delete(socketId);
    pairs.delete(partnerId);
    return partnerId;
  }
  return null;
}

function tryMatch(socketId) {
  // Remove any stale entry first
  removeFromQueue(socketId);

  if (waitingQueue.length > 0) {
    const partnerId = waitingQueue.shift();

    // Register the pair both ways
    pairs.set(socketId, partnerId);
    pairs.set(partnerId, socketId);

    // Tell both clients they have a match.
    // The first user in the queue is the initiator (creates the WebRTC offer).
    io.to(socketId).emit('match_found', { strangerId: partnerId, isInitiator: true });
    io.to(partnerId).emit('match_found', { strangerId: socketId, isInitiator: false });

    console.log(`[Match] ${socketId} ↔ ${partnerId}`);
  } else {
    waitingQueue.push(socketId);
    io.to(socketId).emit('waiting');
    console.log(`[Queue] ${socketId} waiting (queue length: ${waitingQueue.length})`);
  }
}

// ── Connection handler ────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Connect] ${socket.id}`);

  // ── find_match: user wants to be paired ────────────────────────────────
  socket.on('find_match', () => {
    tryMatch(socket.id);
  });

  // ── skip_user: leave current pair and re-queue ─────────────────────────
  socket.on('skip_user', () => {
    const partnerId = unpair(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('stranger_disconnected');
      console.log(`[Skip] ${socket.id} skipped ${partnerId}`);
    }
    // Don't auto-requeue — let the client decide (it'll emit find_match)
  });

  // ── WebRTC relay ───────────────────────────────────────────────────────
  socket.on('webrtc_offer', ({ offer, to }) => {
    io.to(to).emit('webrtc_offer_received', { offer, from: socket.id });
  });

  socket.on('webrtc_answer', ({ answer, to }) => {
    io.to(to).emit('webrtc_answer_received', { answer, from: socket.id });
  });

  socket.on('ice_candidate', ({ candidate, to }) => {
    io.to(to).emit('ice_candidate_received', { candidate, from: socket.id });
  });

  // ── Chat relay ─────────────────────────────────────────────────────────
  socket.on('send_message', ({ text }) => {
    const partnerId = pairs.get(socket.id);
    if (partnerId && text?.trim()) {
      io.to(partnerId).emit('receive_message', { text, from: socket.id });
    }
  });

  socket.on('typing', ({ isTyping }) => {
    const partnerId = pairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('stranger_typing', { isTyping });
    }
  });

  // ── Disconnect cleanup ─────────────────────────────────────────────────
  socket.on('disconnect', () => {
    removeFromQueue(socket.id);
    const partnerId = unpair(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('stranger_disconnected');
      console.log(`[Disconnect] ${socket.id} → notified ${partnerId}`);
    }
    console.log(`[Disconnect] ${socket.id}`);
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connections: io.engine.clientsCount,
    waiting: waitingQueue.length,
    pairs: pairs.size / 2,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀  Nexus signalling server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
