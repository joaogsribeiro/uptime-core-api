import prisma from '../config/database.js';

class AdminCheckExecutionController {
  async index(req, res) {
    try {
      const { monitorId, statusCode } = req.query;

      // Filtros opcionais permitem investigar histórico por monitor ou status HTTP.
      const where = {};

      if (monitorId) {
        where.monitorId = monitorId;
      }

      if (statusCode) {
        const parsedStatusCode = Number(statusCode);

        if (!Number.isInteger(parsedStatusCode)) {
          return res.status(400).json({ error: 'Código de status inválido.' });
        }

        where.status_code = parsedStatusCode;
      }

      const executions = await prisma.checkExecution.findMany({
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
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      return res.status(200).json(executions);
    } catch (error) {
      console.error('Erro ao listar execuções de checagem:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const execution = await prisma.checkExecution.findUnique({
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
        },
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execução de checagem não encontrada.' });
      }

      return res.status(200).json(execution);
    } catch (error) {
      console.error('Erro ao buscar execução de checagem:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const execution = await prisma.checkExecution.findUnique({
        where: { id },
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execução de checagem não encontrada.' });
      }

      // Remoção administrativa permite limpeza controlada de histórico operacional.
      await prisma.checkExecution.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover execução de checagem:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new AdminCheckExecutionController();
