import prisma from '../config/database.js';

const VALID_INCIDENT_STATUSES = ['OPEN', 'RESOLVED'];

class AdminIncidentController {
  async index(req, res) {
    try {
      const { status, monitorId } = req.query;

      // Filtros opcionais para facilitar auditoria operacional.
      const where = {};

      if (status) {
        if (!VALID_INCIDENT_STATUSES.includes(status)) {
          return res.status(400).json({ error: 'Status de incidente inválido.' });
        }

        where.status = status;
      }

      if (monitorId) {
        where.monitorId = monitorId;
      }

      const incidents = await prisma.incident.findMany({
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
          alerts: {
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
      });

      return res.status(200).json(incidents);
    } catch (error) {
      console.error('Erro ao listar incidentes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const incident = await prisma.incident.findUnique({
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
          alerts: {
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
      });

      if (!incident) {
        return res.status(404).json({ error: 'Incidente não encontrado.' });
      }

      return res.status(200).json(incident);
    } catch (error) {
      console.error('Erro ao buscar incidente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async resolve(req, res) {
    try {
      const { id } = req.params;

      const incident = await prisma.incident.findUnique({
        where: { id },
      });

      if (!incident) {
        return res.status(404).json({ error: 'Incidente não encontrado.' });
      }

      // Evita sobrescrever a data de resolução de um incidente já fechado.
      if (incident.status === 'RESOLVED') {
        return res.status(400).json({ error: 'Este incidente já está resolvido.' });
      }

      // A resolução manual é uma ação administrativa controlada.
      const resolvedIncident = await prisma.incident.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      return res.status(200).json(resolvedIncident);
    } catch (error) {
      console.error('Erro ao resolver incidente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async reopen(req, res) {
    try {
      const { id } = req.params;

      const incident = await prisma.incident.findUnique({
        where: { id },
      });

      if (!incident) {
        return res.status(404).json({ error: 'Incidente não encontrado.' });
      }

      // Reabrir remove resolvedAt para manter coerência com status OPEN.
      if (incident.status === 'OPEN') {
        return res.status(400).json({ error: 'Este incidente já está aberto.' });
      }

      const reopenedIncident = await prisma.incident.update({
        where: { id },
        data: {
          status: 'OPEN',
          resolvedAt: null,
        },
      });

      return res.status(200).json(reopenedIncident);
    } catch (error) {
      console.error('Erro ao reabrir incidente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const incident = await prisma.incident.findUnique({
        where: { id },
      });

      if (!incident) {
        return res.status(404).json({ error: 'Incidente não encontrado.' });
      }

      // Remoção fica restrita ao admin para manutenção/auditoria do histórico.
      await prisma.incident.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover incidente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new AdminIncidentController();
