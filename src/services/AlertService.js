import prisma from '../config/database.js';

class AlertService {
  /**
   * Registra a intenção de envio de e-mail no banco e simula a saída no terminal.
   */
  async sendMockEmail(monitorId, incidentId, status, reason) {
    try {
      // Busca os dados do monitor e do usuário para enriquecer o e-mail
      const monitor = await prisma.monitor.findUnique({
        where: { id: monitorId },
        include: { user: { select: { name: true, email: true } } },
      });

      if (!monitor || !monitor.user) return;

      let subject = '';
      let message = '';

      if (status === 'FALHA') {
        subject = `[ALERTA CRÍTICO] O monitor "${monitor.name}" caiu`;
        message = `Olá, ${monitor.user.name}. Detectamos que o serviço associado à URL (${monitor.url}) parou de responder. Motivo: ${reason}`;
      } else {
        subject = `[RECUPERAÇÃO] O monitor "${monitor.name}" voltou a operar`;
        message = `Olá, ${monitor.user.name}. Boas notícias! O serviço associado à URL (${monitor.url}) voltou a responder com sucesso (200 OK).`;
      }

      // Persiste a notificação no banco de dados
      const alert = await prisma.alert.create({
        data: {
          monitorId,
          incidentId,
          type: 'EMAIL',
          message: `${subject} - ${message}`,
        },
      });

      // Simula o disparo no terminal
      console.log(`\n======================================================`);
      console.log(`📧 [MOCK EMAIL DISPARADO]`);
      console.log(`Para: ${monitor.user.email}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Mensagem: ${message}`);
      console.log(`Status do Banco: Alerta salvo (ID: ${alert.id})`);
      console.log(`======================================================\n`);
    } catch (error) {
      console.error(`Erro ao gerar alerta para o monitor ${monitorId}:`, error);
    }
  }
}

export default new AlertService();
