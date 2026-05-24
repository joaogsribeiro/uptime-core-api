import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Administração de Alertas Operacionais', () => {
  let adminToken;
  let regularToken;
  let monitor;
  let incident;
  let alert;

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
        email: 'usuario.alertas@exemplo.com',
        password_hash: 'hash',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin.alertas@exemplo.com',
        password_hash: 'hash',
        role: 'ADMIN',
      },
    });

    const monitorOwner = await prisma.user.create({
      data: {
        name: 'Dono do Monitor',
        email: 'owner.alertas@exemplo.com',
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
        name: 'Monitor de Alertas',
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

    alert = await prisma.alert.create({
      data: {
        monitorId: monitor.id,
        incidentId: incident.id,
        type: 'EMAIL',
        message: '[ALERTA CRÍTICO] Monitor de Alertas caiu',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- SEGURANÇA ---

  it('não deve permitir listar alertas sem token', async () => {
    const response = await request(app).get('/api/admin/alerts');

    expect(response.status).toBe(401);
  });

  it('não deve permitir listar alertas com usuário comum', async () => {
    const response = await request(app)
      .get('/api/admin/alerts')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });

  // --- CONSULTAS ADMINISTRATIVAS ---

  it('deve listar alertas para administradores', async () => {
    const response = await request(app)
      .get('/api/admin/alerts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.some((item) => item.id === alert.id)).toBe(true);
  });

  it('deve filtrar alertas por monitor', async () => {
    const response = await request(app)
      .get(`/api/admin/alerts?monitorId=${monitor.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.monitorId === monitor.id)).toBe(true);
  });

  it('deve filtrar alertas por incidente', async () => {
    const response = await request(app)
      .get(`/api/admin/alerts?incidentId=${incident.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.incidentId === incident.id)).toBe(true);
  });

  it('deve filtrar alertas por tipo', async () => {
    const response = await request(app)
      .get('/api/admin/alerts?type=EMAIL')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.type === 'EMAIL')).toBe(true);
  });

  it('deve buscar um alerta por ID com monitor e incidente', async () => {
    const response = await request(app)
      .get(`/api/admin/alerts/${alert.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(alert.id);
    expect(response.body.monitor.id).toBe(monitor.id);
    expect(response.body.incident.id).toBe(incident.id);
  });

  it('deve retornar 404 ao buscar alerta inexistente', async () => {
    const response = await request(app)
      .get('/api/admin/alerts/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  // --- LIMPEZA ADMINISTRATIVA ---

  it('deve remover um alerta por ação administrativa', async () => {
    const tempAlert = await prisma.alert.create({
      data: {
        monitorId: monitor.id,
        incidentId: incident.id,
        type: 'EMAIL',
        message: 'Alerta temporário',
      },
    });

    const response = await request(app)
      .delete(`/api/admin/alerts/${tempAlert.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const deletedAlert = await prisma.alert.findUnique({
      where: { id: tempAlert.id },
    });

    expect(deletedAlert).toBeNull();
  });
});
