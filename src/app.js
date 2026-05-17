import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { globalErrorHandler } from './middlewares/errorMiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import AppError from './utils/AppError.js';

const app = express();

// Blindagem de Cabeçalho (Remove o X-Powered-By)
app.disable('x-powered-by');

// Configuração Estrita de CORS
app.use(
  cors({
    // Em desenvolvimento aceita de qualquer lugar, em produção só do seu domínio
    origin: process.env.NODE_ENV === 'production' ? ['https://seu-dominio-futuro.com.br'] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const apiPresentation = {
  status: 'ok',
  name: 'UptimeCore API',
  version: '1.0.0',
  description: 'API de monitoramento de disponibilidade e tempo de resposta',
  documentation: '/api/docs',
  endpoints: {
    health: '/api/health',
    auth: '/api/auth',
    users: '/api/users',
    monitors: '/api/monitors',
    admin: '/api/admin',
  },
};

// Rotas de apresentação da API
app.get(['/', '/api'], (req, res) => {
  return res.status(200).json(apiPresentation);
});

// Rota de Health Check (Crítica para a Infraestrutura)
app.get('/api/health', (req, res) => {
  const saoPauloTimestamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replace(' ', 'T');

  return res.status(200).json({
    status: 'ok',
    timestamp: `${saoPauloTimestamp}-03:00`,
  });
});

// Rotas de Autenticação (Públicas)
app.use('/api/auth', authRoutes);

// Rotas de Domínio (Protegidas por JWT internamente nos arquivos de rota)
app.use('/api/users', userRoutes);
app.use('/api/monitors', monitorRoutes);

// Rotas Administrativas (Protegidas por JWT + Admin Middleware)
app.use('/api/admin', adminRoutes);

// Tratamento para rotas que não existem (404)
app.use((req, res, next) => {
  next(new AppError(`A rota ${req.originalUrl} não foi encontrada neste servidor.`, 404));
});

// O Middleware Global de Erro
app.use(globalErrorHandler);

export default app;
