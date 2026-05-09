import cron from 'node-cron';
import prisma from '../config/database.js';
import IncidentService from './IncidentService.js';
import PingService from './PingService.js';

class SchedulerService {
  start() {
    console.log('⏰ Scheduler de Monitoramento iniciado.');

    // A expressão '* * * * *' significa: execute a cada 1 minuto
    cron.schedule('* * * * *', async () => {
      try {
        const currentMinute = new Date().getMinutes();
        
        // 1. Busca apenas os monitores que estão com status ACTIVE
        const activeMonitors = await prisma.monitor.findMany({
          where: { status: 'ACTIVE' }
        });

        if (activeMonitors.length === 0) return;

        // 2. Filtra quem deve rodar NESTE minuto específico
        const monitorsToRun = activeMonitors.filter(monitor => {
          // Lógica de intervalo: Se o intervalo é 5, roda nos minutos 0, 5, 10, 15...
          return currentMinute % monitor.interval_minutes === 0;
        });

        if (monitorsToRun.length === 0) return;

        console.log(`[CRON] Executando ping para ${monitorsToRun.length} monitor(es)...`);

        // 3. Executa os pings de forma sequencial para não estourar o Event Loop (MVP seguro)
        // Em um cenário de altíssima escala, usaríamos filas (RabbitMQ/Redis)
        for (const monitor of monitorsToRun) {
          try {
            const pingResult = await PingService.execute(monitor.url);
            await IncidentService.handleStatus(monitor.id, pingResult);
          } catch (err) {
            // Isolamos o try/catch por monitor! 
            // Se um site explodir, não derruba a verificação dos outros.
            console.error(`Falha isolada ao processar monitor ${monitor.id}:`, err);
          }
        }
      } catch (error) {
        console.error('Erro crítico no ciclo do Scheduler:', error);
      }
    });
  }
}

export default new SchedulerService();