import prisma from '../config/database.js';

class AdminAlertController {
  async index(req, res) {
    try {
      const { monitorId, incidentId, type } = req.query;

      // Filtros opcionais ajudam auditoria sem expor alteração manual do histórico.
      const where = {};

      if (monitorId) {
        where.monitorId = monitorId;
      }

      if (incidentId) {
        where.incidentId = incidentId;
      }

      if (type) {
        where.type = type;
      }

      const alerts = await prisma.alert.findMany({
        where,
        include: {
          monitor: {
            select: {
              id: true,
              name: true,
              url: true,
              status: true,
              userId: true,
            },
          },
          incident: {
            select: {
              id: true,
              status: true,
              errorLog: true,
              startedAt: true,
              resolvedAt: true,
            },
          },
        },
        orderBy: {
          sentAt: 'desc',
        },
      });

      return res.status(200).json(alerts);
    } catch (error) {
      console.error('Erro ao listar alertas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.findUnique({
        where: { id },
        include: {
          monitor: {
            select: {
              id: true,
              name: true,
              url: true,
              status: true,
              userId: true,
            },
          },
          incident: {
            select: {
              id: true,
              status: true,
              errorLog: true,
              startedAt: true,
              resolvedAt: true,
            },
          },
        },
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alerta não encontrado.' });
      }

      return res.status(200).json(alert);
    } catch (error) {
      console.error('Erro ao buscar alerta:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.findUnique({
        where: { id },
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alerta não encontrado.' });
      }

      // A remoção é restrita ao admin para limpeza controlada de registros operacionais.
      await prisma.alert.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover alerta:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new AdminAlertController();
