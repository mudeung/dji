const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

const { getDrones } = require("./dji");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// =========================
// 🔥 REST API (드론 상태)
// =========================
app.get("/drones", async (req, res) => {
    try {
        const data = await getDrones();

        // DJI raw → frontend format 변환
        const drones = (data.devices || []).map(d => ({
            id: d.device_sn,
            lat: d.position?.latitude || 0,
            lng: d.position?.longitude || 0,
            battery: d.battery || null,
            status: d.status || "unknown"
        }));

        res.json(drones);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch drones" });
    }
});

// =========================
// 🔥 WebSocket 실시간 push
// =========================
wss.on("connection", ws => {
    console.log("Client connected");
});

// 주기적으로 드론 데이터 push
async function broadcastDrones() {
    try {
        const data = await getDrones();

        const drones = (data.devices || []).map(d => ({
            id: d.device_sn,
            lat: d.position?.latitude || 0,
            lng: d.position?.longitude || 0
        }));

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(drones));
            }
        });

    } catch (err) {
        console.log("broadcast error:", err.message);
    }
}

// 3초마다 업데이트
setInterval(broadcastDrones, 3000);

// =========================
server.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});
