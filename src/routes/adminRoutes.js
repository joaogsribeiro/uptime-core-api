import { Router } from 'express';
import prisma from '../config/database.js';
import authMiddleware from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';

const routes = new Router();

// Todas as rotas administrativas exigem login E ser admin
routes.use(authMiddleware);
routes.use(isAdmin);

// Exemplo de rota restrita: Status geral do sistema (GET /api/admin/status)
routes.get('/status', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalMonitors = await prisma.monitor.count();
    
    return res.json({
      system: 'UptimeCore',
      metrics: {
        users: totalUsers,
        monitors: totalMonitors
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar métricas.' });
  }
});

export default routes;