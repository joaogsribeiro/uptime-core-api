import { Router } from 'express';
import prisma from '../config/database.js';
import AdminIncidentController from '../controllers/AdminIncidentController.js';
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
        monitors: totalMonitors,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return res.status(500).json({ error: 'Erro ao buscar métricas.' });
  }
});

// Endpoints administrativos para auditoria e manutenção de incidentes operacionais.
// Incidentes continuam sendo criados automaticamente pelo IncidentService.
routes.get('/incidents', AdminIncidentController.index);
routes.get('/incidents/:id', AdminIncidentController.show);
routes.patch('/incidents/:id/resolve', AdminIncidentController.resolve);
routes.patch('/incidents/:id/reopen', AdminIncidentController.reopen);
routes.delete('/incidents/:id', AdminIncidentController.delete);

export default routes;
