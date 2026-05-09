import prisma from '../config/database.js';

class IncidentService {
  /**
   * Processa o resultado de um ping, salva a métrica de execução e avalia transições de estado.
   */
  async handleStatus(monitorId, pingResult) {
    try {
      // 1. Persistência de Telemetria: Salva o log exato desta execução
      await prisma.checkExecution.create({
        data: {
          monitorId,
          status_code: pingResult.statusCode,
          response_time_ms: pingResult.responseTimeMs,
        },
      });

      // 2. Busca o estado atual do monitor (se há um incidente não resolvido)
      const openIncident = await prisma.incident.findFirst({
        where: {
          monitorId,
          status: 'OPEN',
        },
      });

      // ==========================================
      // MÁQUINA DE ESTADOS
      // ==========================================

      if (!pingResult.success) {
        // CUIDADO 1: O site falhou
        if (!openIncident) {
          // TRANSIÇÃO DE ESTADO (Saudável -> Falha): Abre um novo incidente
          const newIncident = await prisma.incident.create({
            data: {
              monitorId,
              status: 'OPEN',
              errorLog: pingResult.errorLog,
            },
          });
          
          console.log(`[ALERTA] Monitor ${monitorId} CAIU. Motivo: ${pingResult.errorLog}`);
          // TODO: O disparo de e-mail de "Site Offline" será injetado aqui posteriormente (ADR #5)
          
          return { stateChanged: true, incident: newIncident };
        }
        
        // Se já existe um incidente aberto, é uma falha contínua. Não fazemos nada.
        return { stateChanged: false, incident: openIncident };

      } else {
        // CUIDADO 2: O site respondeu com sucesso (200 OK)
        if (openIncident) {
          // TRANSIÇÃO DE ESTADO (Falha -> Saudável): Resolve o incidente
          const resolvedIncident = await prisma.incident.update({
            where: { id: openIncident.id },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date(),
            },
          });

          console.log(`[RECUPERAÇÃO] Monitor ${monitorId} VOLTOU a ficar online.`);
          // TODO: O disparo de e-mail de "Site Recuperado" será injetado aqui posteriormente (ADR #5)
          
          return { stateChanged: true, incident: resolvedIncident };
        }

        // Se não havia incidente, é um sucesso contínuo. Não fazemos nada.
        return { stateChanged: false, incident: null };
      }
    } catch (error) {
      console.error(`Erro crítico no IncidentService para o monitor ${monitorId}:`, error);
    }
  }
}

export default new IncidentService();