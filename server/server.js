require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const runpodApi = require("./services/runpodApi");
const sshService = require("./services/sshService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// ─── REST API Routes ────────────────────────────────────

// Get all pods
app.get("/api/pods", async (req, res) => {
  try {
    const pods = await runpodApi.getPods();
    res.json(pods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop pod
app.post("/api/pods/:id/stop", async (req, res) => {
  try {
    const result = await runpodApi.stopPod(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start (resume) pod
app.post("/api/pods/:id/start", async (req, res) => {
  try {
    const result = await runpodApi.startPod(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restart pod (stop then resume)
app.post("/api/pods/:id/restart", async (req, res) => {
  try {
    const result = await runpodApi.restartPod(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terminate pod
app.delete("/api/pods/:id", async (req, res) => {
  try {
    const result = await runpodApi.terminatePod(req.params.id);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deploy new pod
app.post("/api/pods/deploy", async (req, res) => {
  try {
    const result = await runpodApi.createPod(req.body);
    res.json(result);
  } catch (err) {
    const message = err.message || "";
    if (message.includes("out_of_stock") || message.includes("no available")) {
      return res
        .status(409)
        .json({ error: "GPU out of stock. Please try a different GPU type." });
    }
    res.status(500).json({ error: message });
  }
});

// Get GPU types
app.get("/api/gpu-types", async (req, res) => {
  try {
    const types = await runpodApi.getGpuTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test API connection
app.post("/api/settings/test", async (req, res) => {
  try {
    const connected = await runpodApi.testConnection();
    res.json({ connected });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// Settings (simple in-memory for now, can persist to file)
let settings = {
  pollingInterval: 10,
  defaultRegion: "US-East-1",
};

app.get("/api/settings", (req, res) => {
  res.json({
    ...settings,
    apiKeySet:
      !!process.env.RUNPOD_API_KEY &&
      process.env.RUNPOD_API_KEY !== "YOUR_API_KEY_HERE",
  });
});

app.post("/api/settings", (req, res) => {
  const { pollingInterval, defaultRegion, apiKey } = req.body;
  if (pollingInterval) settings.pollingInterval = pollingInterval;
  if (defaultRegion) settings.defaultRegion = defaultRegion;
  if (apiKey) process.env.RUNPOD_API_KEY = apiKey;
  res.json({ success: true });
});
app.get("/api/templates", (req, res) => {
  runpodApi
    .getTemplates()
    .then((templates) => {
      res.json(templates);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});
// ─── Socket.io ──────────────────────────────────────────

// Cache pod data for SSH connections
let podCache = [];
async function refreshPodCache() {
  try {
    podCache = await runpodApi.getPods();
  } catch {}
}
refreshPodCache();
setInterval(refreshPodCache, 30000);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Log streaming
  socket.on("logs:subscribe", ({ podId }) => {
    const pod = podCache.find((p) => p.id === podId);
    if (!pod) {
      socket.emit("logs:disconnected", { error: "Pod not found" });
      return;
    }
    sshService.startLogStream(socket, pod);
  });

  socket.on("logs:unsubscribe", ({ podId }) => {
    sshService.disconnect(`logs-${podId}-${socket.id}`);
  });

  // SSH terminal
  socket.on("ssh:connect", ({ podId }) => {
    const pod = podCache.find((p) => p.id === podId);
    if (!pod) {
      socket.emit("ssh:error", { error: "Pod not found" });
      return;
    }
    sshService.createShell(socket, pod);
  });

  socket.on("ssh:disconnect", ({ podId }) => {
    sshService.disconnect(`ssh-${podId}-${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    sshService.disconnectAll(socket.id);
  });
});

// ─── Start Server ───────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`RunPod Admin Server running on port ${PORT}`);
});
