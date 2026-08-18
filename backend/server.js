import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the CodeVerse API'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[CodeVerse Server] API Server running on port ${PORT}`);
});
