const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://glosa-frontend.pages.dev',
  'http://localhost:5173',
  /\.run\.app$/  // All Cloud Run service URLs
];


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glosa-bharat';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB (Localhost:27017)'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin));
      if (isAllowed) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
  }
});

io.on('connection', (socket) => {
    console.log(`📡 [WS] User connected: ${socket.id}`);
    
    let timer = null;

    // Listen for navigation start event from the React app
    socket.on('start_navigation', (data) => {
        const { junctions, lat, lng } = data;
        console.log(`🚗 [WS] Route started for ${socket.id} with ${junctions?.length || 0} junctions.`);
        
        if (timer) clearInterval(timer);
        
        // Push simulated live countdowns and dynamic speeds every 1000ms
        timer = setInterval(() => {
            const updates = (junctions || []).map(j => {
                const cycle = 60;
                // Add a small pseudo-random offset based on junction ID so they aren't all perfectly synced
                const offset = (j.id ? j.id.toString().charCodeAt(0) : 0) % 20; 
                const pos = Math.floor((Date.now() / 1000) + offset) % cycle;

                let status = 'GREEN';
                let secs = 0;
                
                // Typical cycle: 30s RED -> 25s GREEN -> 5s AMBER
                if (pos < 30) {
                    status = 'RED';
                    secs = 30 - pos;
                } else if (pos < 55) {
                    status = 'GREEN';
                    secs = 55 - pos;
                } else {
                    status = 'AMBER';
                    secs = 60 - pos;
                }

                // Make the speed oscillate slightly to seem real-time and active (not blank)
                const baseSpeed = status === 'RED' ? 25 : 45;
                const dynamicSpeed = baseSpeed + Math.floor(Math.random() * 5);

                const mockDistance = Math.floor(Math.random() * 10) + 400; // Mock distance

                return { 
                    id: j.id,
                    name: j.name,
                    status, 
                    secondsToChange: secs,
                    distance: mockDistance,
                    recommendedSpeed: dynamicSpeed 
                };
            });

            socket.emit('glosa_update', updates);
        }, 1000);
    });

    socket.on('disconnect', () => {
        console.log(`❌ [WS] User disconnected: ${socket.id}`);
        if (timer) clearInterval(timer);
    });
});

// Main API Route
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'GLOSA-Bharat Backend is running', version: '2.0' });
});

// Health check endpoint — required by Cloud Run & Dockerfile
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'glosa-backend', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
