import prisma from '../config/database.js';
import AlertService from './AlertService.js';

class IncidentService {
  async handleStatus(monitorId, pingResult) {
    try {
      await prisma.checkExecution.create({
        data: {
          monitorId,
          status_code: pingResult.statusCode,
          response_time_ms: pingResult.responseTimeMs,
        },
      });

      const openIncident = await prisma.incident.findFirst({
        where: {
          monitorId,
          status: 'OPEN',
        },
      });

      if (!pingResult.success) {
        if (!openIncident) {
          const newIncident = await prisma.incident.create({
            data: {
              monitorId,
              status: 'OPEN',
              errorLog: pingResult.errorLog,
            },
          });

          console.log(`[ALERTA] Monitor ${monitorId} CAIU. Motivo: ${pingResult.errorLog}`);

          // TRANSIÇÃO PARA FALHA: Dispara o alerta
          await AlertService.sendMockEmail(monitorId, newIncident.id, 'FALHA', pingResult.errorLog);

          return { stateChanged: true, incident: newIncident };
        }

        return { stateChanged: false, incident: openIncident };
      } else {
        if (openIncident) {
          const resolvedIncident = await prisma.incident.update({
            where: { id: openIncident.id },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date(),
            },
          });

          console.log(`[RECUPERAÇÃO] Monitor ${monitorId} VOLTOU a ficar online.`);

          // TRANSIÇÃO PARA RECUPERAÇÃO: Dispara o alerta
          await AlertService.sendMockEmail(monitorId, resolvedIncident.id, 'RECUPERACAO', null);

          return { stateChanged: true, incident: resolvedIncident };
        }

        return { stateChanged: false, incident: null };
      }
    } catch (error) {
      console.error(`Erro crítico no IncidentService para o monitor ${monitorId}:`, error);
    }
  }
}

export default new IncidentService();
