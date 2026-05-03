import prisma from '../config/database.js';

class MonitorController {
  async create(req, res) {
    try {
      const { url, interval_minutes } = req.body;
      const userId = req.userId;

      if (!userId || !url) {
        return res.status(400).json({ error: 'A URL é obrigatória.' });
      }

      try {
        new URL(url);
      } catch (err) {
        console.error('Formato de URL inválido:', err);
        return res.status(400).json({ error: 'Formato de URL inválido.' });
      }

      const monitor = await prisma.monitor.create({
        data: {
          userId,
          url,
          interval_minutes: interval_minutes || 5,
        },
      });

      return res.status(201).json(monitor);
    } catch (error) {
      console.error('Erro ao criar monitor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async index(req, res) {
    try {
      const monitors = await prisma.monitor.findMany({
        where: { userId: req.userId },
      });
      return res.status(200).json(monitors);
    } catch (error) {
      console.error('Erro ao listar monitores:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      
      const monitor = await prisma.monitor.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor não encontrado.' });
      }

      // Trava de segurança: Apenas o dono ou um ADMIN pode ver os detalhes
      if (req.userRole !== 'ADMIN' && monitor.userId !== req.userId) {
        return res.status(403).json({ error: 'Você não tem permissão para acessar este monitor.' });
      }

      return res.status(200).json(monitor);
    } catch (error) {
      console.error('Erro ao buscar monitor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { url, interval_minutes, status } = req.body;

      const monitorExists = await prisma.monitor.findUnique({ where: { id } });
      if (!monitorExists) {
        return res.status(404).json({ error: 'Monitor não encontrado.' });
      }

      // Trava de segurança IDOR
      if (req.userRole !== 'ADMIN' && monitorExists.userId !== req.userId) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este monitor.' });
      }

      if (url) {
        try {
          new URL(url);
        } catch (err) {
          console.error('Formato de URL inválido:', err);
          return res.status(400).json({ error: 'Formato de URL inválido.' });
        }
      }

      const monitor = await prisma.monitor.update({
        where: { id },
        data: { url, interval_minutes, status },
      });

      return res.status(200).json(monitor);
    } catch (error) {
      console.error('Erro ao atualizar monitor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const monitorExists = await prisma.monitor.findUnique({ where: { id } });
      if (!monitorExists) {
        return res.status(404).json({ error: 'Monitor não encontrado.' });
      }

      // Trava de segurança IDOR
      if (req.userRole !== 'ADMIN' && monitorExists.userId !== req.userId) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar este monitor.' });
      }

      await prisma.monitor.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar monitor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new MonitorController();