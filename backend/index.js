const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
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

// Main API Route
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'GLOSA-Bharat Backend is running', version: '2.0' });
});

// Health check endpoint — required by Cloud Run & Dockerfile
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'glosa-backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
