import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Health Check (Crítica para a Infraestrutura)
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);

export default app;