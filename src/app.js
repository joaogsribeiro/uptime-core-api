import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Health Check (Crítica para a Infraestrutura)
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de Autenticação (Públicas)
app.use('/api/auth', authRoutes);

// Rotas de Domínio (Protegidas por JWT internamente nos arquivos de rota)
app.use('/api/users', userRoutes);
app.use('/api/monitors', monitorRoutes);

// Rotas Administrativas (Protegidas por JWT + Admin Middleware)
app.use('/api/admin', adminRoutes);

export default app;
