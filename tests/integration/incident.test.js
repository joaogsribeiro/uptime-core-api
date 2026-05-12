import { jest } from '@jest/globals';
import prisma from '../../src/config/database.js';
import AlertService from '../../src/services/AlertService.js';
import IncidentService from '../../src/services/IncidentService.js';

describe('Integração: Regras de Negócio de Incidentes e Alertas', () => {
  let testMonitor;

  beforeAll(async () => {
    // Limpeza em cascata rigorosa
    await prisma.alert.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.checkExecution.deleteMany();
    await prisma.monitor.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        name: 'Engenheiro de Confiabilidade',
        email: 'sre@exemplo.com',
        password_hash: 'hash',
      },
    });

    testMonitor = await prisma.monitor.create({
      data: {
        name: 'API Crítica (Testes)',
        url: 'https://api.critica.com',
        interval_minutes: 1,
        userId: user.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- BLOCO 1: A QUEDA ---

  it('deve registrar execução, abrir incidente e disparar alerta na primeira falha', async () => {
    // Espionamos o AlertService para saber se o sistema tentou avisar o cliente
    const alertSpy = jest.spyOn(AlertService, 'sendMockEmail');

    // Forjamos um retorno catastrófico do PingService
    const mockPingFalha = {
      success: false,
      statusCode: 500,
      responseTimeMs: 2500,
      errorLog: 'HTTP Error 500',
    };

    // Acionamos o cérebro do sistema diretamente
    const result = await IncidentService.handleStatus(testMonitor.id, mockPingFalha);

    // Validações de Transição de Estado
    expect(result.stateChanged).toBe(true);
    expect(result.incident.status).toBe('OPEN');

    // Validações de Persistência (Banco de Dados)
    const executions = await prisma.checkExecution.findMany({
      where: { monitorId: testMonitor.id },
    });
    expect(executions.length).toBe(1);

    const alerts = await prisma.alert.findMany({ where: { monitorId: testMonitor.id } });
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('EMAIL');

    // Validação de Integração (O serviço de alerta foi chamado com os dados certos?)
    expect(alertSpy).toHaveBeenCalledWith(
      testMonitor.id,
      result.incident.id,
      'FALHA',
      'HTTP Error 500'
    );

    alertSpy.mockRestore(); // Limpa o espião para o próximo teste
  });

  // --- BLOCO 2: O CAOS CONTINUA ---

  it('NÃO deve gerar novo alerta ou duplicar incidentes se o monitor continuar caindo', async () => {
    const alertSpy = jest.spyOn(AlertService, 'sendMockEmail');

    // Forjamos uma nova falha, desta vez por Timeout
    const mockPingFalhaContinua = {
      success: false,
      statusCode: null,
      responseTimeMs: 10000,
      errorLog: 'Timeout (10000ms)',
    };

    const result = await IncidentService.handleStatus(testMonitor.id, mockPingFalhaContinua);

    // O estado NÃO deve mudar, o incidente já estava aberto
    expect(result.stateChanged).toBe(false);

    // A prova de fogo contra SPAM: Nenhum e-mail deve ter sido enviado
    expect(alertSpy).not.toHaveBeenCalled();

    // Deve continuar existindo apenas 1 incidente no banco
    const incidents = await prisma.incident.findMany({ where: { monitorId: testMonitor.id } });
    expect(incidents.length).toBe(1);

    alertSpy.mockRestore();
  });

  // --- BLOCO 3: A RECUPERAÇÃO ---

  it('deve resolver o incidente e gerar alerta de recuperação quando o site voltar', async () => {
    const alertSpy = jest.spyOn(AlertService, 'sendMockEmail');

    // O herói da infraestrutura resolveu o problema (200 OK)
    const mockPingSucesso = {
      success: true,
      statusCode: 200,
      responseTimeMs: 120,
      errorLog: null,
    };

    const result = await IncidentService.handleStatus(testMonitor.id, mockPingSucesso);

    expect(result.stateChanged).toBe(true);
    expect(result.incident.status).toBe('RESOLVED');
    expect(result.incident.resolvedAt).not.toBeNull();

    // Verifica se o banco guardou o registro de recuperação
    const alerts = await prisma.alert.findMany({
      where: { monitorId: testMonitor.id },
      orderBy: { sentAt: 'desc' },
    });

    expect(alerts.length).toBe(2); // 1 de falha original, 1 de recuperação agora
    expect(alertSpy).toHaveBeenCalledWith(testMonitor.id, result.incident.id, 'RECUPERACAO', null);

    alertSpy.mockRestore();
  });
});
