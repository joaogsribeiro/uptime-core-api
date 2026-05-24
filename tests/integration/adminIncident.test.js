import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Administração de Incidentes Operacionais', () => {
  let adminToken;
  let regularToken;
  let monitor;
  let incident;

  beforeAll(async () => {
    // Limpeza em ordem segura por causa dos relacionamentos entre entidades.
    await prisma.alert.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.checkExecution.deleteMany();
    await prisma.monitor.deleteMany();
    await prisma.user.deleteMany();

    const regularUser = await prisma.user.create({
      data: {
        name: 'Usuário Comum',
        email: 'usuario.incidentes@exemplo.com',
        password_hash: 'hash',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin.incidentes@exemplo.com',
        password_hash: 'hash',
        role: 'ADMIN',
      },
    });

    const monitorOwner = await prisma.user.create({
      data: {
        name: 'Dono do Monitor',
        email: 'owner.incidentes@exemplo.com',
        password_hash: 'hash',
      },
    });

    // Tokens forjados para testar autorização sem depender do fluxo de login.
    regularToken = jwt.sign({ id: regularUser.id, role: 'USER' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    adminToken = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    monitor = await prisma.monitor.create({
      data: {
        name: 'Monitor de Incidentes',
        url: 'https://httpbin.org/status/500',
        interval_minutes: 1,
        userId: monitorOwner.id,
      },
    });

    incident = await prisma.incident.create({
      data: {
        monitorId: monitor.id,
        status: 'OPEN',
        errorLog: 'HTTP Error 500',
      },
    });

    await prisma.alert.create({
      data: {
        monitorId: monitor.id,
        incidentId: incident.id,
        type: 'EMAIL',
        message: '[ALERTA CRÍTICO] Monitor de Incidentes caiu',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- SEGURANÇA ---

  it('não deve permitir listar incidentes sem token', async () => {
    const response = await request(app).get('/api/admin/incidents');

    expect(response.status).toBe(401);
  });

  it('não deve permitir listar incidentes com usuário comum', async () => {
    const response = await request(app)
      .get('/api/admin/incidents')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });

  // --- CONSULTAS ADMINISTRATIVAS ---

  it('deve listar incidentes para administradores', async () => {
    const response = await request(app)
      .get('/api/admin/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.some((item) => item.id === incident.id)).toBe(true);
  });

  it('deve filtrar incidentes por status', async () => {
    const response = await request(app)
      .get('/api/admin/incidents?status=OPEN')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.status === 'OPEN')).toBe(true);
  });

  it('deve rejeitar filtro de status inválido', async () => {
    const response = await request(app)
      .get('/api/admin/incidents?status=INVALID')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('deve buscar um incidente por ID com monitor e alertas', async () => {
    const response = await request(app)
      .get(`/api/admin/incidents/${incident.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(incident.id);
    expect(response.body.monitor.id).toBe(monitor.id);
    expect(response.body.alerts).toBeInstanceOf(Array);
  });

  // --- AÇÕES CONTROLADAS DE DOMÍNIO ---

  it('deve resolver manualmente um incidente aberto', async () => {
    const response = await request(app)
      .patch(`/api/admin/incidents/${incident.id}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('RESOLVED');
    expect(response.body.resolvedAt).not.toBeNull();
  });

  it('deve impedir resolver um incidente já resolvido', async () => {
    const response = await request(app)
      .patch(`/api/admin/incidents/${incident.id}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('deve reabrir manualmente um incidente resolvido', async () => {
    const response = await request(app)
      .patch(`/api/admin/incidents/${incident.id}/reopen`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OPEN');
    expect(response.body.resolvedAt).toBeNull();
  });

  it('deve impedir reabrir um incidente já aberto', async () => {
    const response = await request(app)
      .patch(`/api/admin/incidents/${incident.id}/reopen`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('deve remover um incidente por ação administrativa', async () => {
    const tempIncident = await prisma.incident.create({
      data: {
        monitorId: monitor.id,
        status: 'OPEN',
        errorLog: 'Incidente temporário',
      },
    });

    const response = await request(app)
      .delete(`/api/admin/incidents/${tempIncident.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const deletedIncident = await prisma.incident.findUnique({
      where: { id: tempIncident.id },
    });

    expect(deletedIncident).toBeNull();
  });
});
