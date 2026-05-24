import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Administração de Execuções de Checagem', () => {
  let adminToken;
  let regularToken;
  let monitor;
  let checkExecution;

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
        email: 'usuario.execucoes@exemplo.com',
        password_hash: 'hash',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin.execucoes@exemplo.com',
        password_hash: 'hash',
        role: 'ADMIN',
      },
    });

    const monitorOwner = await prisma.user.create({
      data: {
        name: 'Dono do Monitor',
        email: 'owner.execucoes@exemplo.com',
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
        name: 'Monitor de Execuções',
        url: 'https://httpbin.org/status/200',
        interval_minutes: 1,
        userId: monitorOwner.id,
      },
    });

    checkExecution = await prisma.checkExecution.create({
      data: {
        monitorId: monitor.id,
        status_code: 200,
        response_time_ms: 120,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- SEGURANÇA ---

  it('não deve permitir listar execuções sem token', async () => {
    const response = await request(app).get('/api/admin/check-executions');

    expect(response.status).toBe(401);
  });

  it('não deve permitir listar execuções com usuário comum', async () => {
    const response = await request(app)
      .get('/api/admin/check-executions')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });

  // --- CONSULTAS ADMINISTRATIVAS ---

  it('deve listar execuções para administradores', async () => {
    const response = await request(app)
      .get('/api/admin/check-executions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.some((item) => item.id === checkExecution.id)).toBe(true);
  });

  it('deve filtrar execuções por monitor', async () => {
    const response = await request(app)
      .get(`/api/admin/check-executions?monitorId=${monitor.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.monitorId === monitor.id)).toBe(true);
  });

  it('deve filtrar execuções por status HTTP', async () => {
    const response = await request(app)
      .get('/api/admin/check-executions?statusCode=200')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.every((item) => item.status_code === 200)).toBe(true);
  });

  it('deve rejeitar filtro de status HTTP inválido', async () => {
    const response = await request(app)
      .get('/api/admin/check-executions?statusCode=abc')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('deve buscar uma execução por ID com dados do monitor', async () => {
    const response = await request(app)
      .get(`/api/admin/check-executions/${checkExecution.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(checkExecution.id);
    expect(response.body.monitor.id).toBe(monitor.id);
  });

  it('deve retornar 404 ao buscar execução inexistente', async () => {
    const response = await request(app)
      .get('/api/admin/check-executions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  // --- LIMPEZA ADMINISTRATIVA ---

  it('deve remover uma execução por ação administrativa', async () => {
    const tempExecution = await prisma.checkExecution.create({
      data: {
        monitorId: monitor.id,
        status_code: 500,
        response_time_ms: 350,
      },
    });

    const response = await request(app)
      .delete(`/api/admin/check-executions/${tempExecution.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const deletedExecution = await prisma.checkExecution.findUnique({
      where: { id: tempExecution.id },
    });

    expect(deletedExecution).toBeNull();
  });
});
