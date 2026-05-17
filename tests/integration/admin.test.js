import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Rota Administrativa (Admin)', () => {
  let adminToken;
  let regularToken;

  beforeAll(async () => {
    await prisma.user.deleteMany();

    // 1. Criação do Usuário Comum
    const regularUser = await prisma.user.create({
      data: { name: 'Comum', email: 'comum@exemplo.com', password_hash: 'hash' },
    });

    // 2. Criação do Administrador
    const adminUser = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@exemplo.com', password_hash: 'hash', role: 'ADMIN' },
    });

    // 3. Forjando os tokens (não esqueça da propriedade de administrador no payload!)
    regularToken = jwt.sign({ id: regularUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- VALIDAÇÕES DE SEGURANÇA ---

  it('não deve permitir acesso ao status sem token (401 Unauthorized)', async () => {
    const response = await request(app).get('/api/admin/status');
    expect(response.status).toBe(401);
  });

  it('deve bloquear o acesso ao status para usuários comuns (403 Forbidden)', async () => {
    const response = await request(app)
      .get('/api/admin/status')
      .set('Authorization', `Bearer ${regularToken}`);

    expect([401, 403]).toContain(response.status);
  });

  // --- FLUXO FELIZ ADMINISTRATIVO ---

  it('deve retornar os dados de telemetria quando autenticado como administrador (200 OK)', async () => {
    const response = await request(app)
      .get('/api/admin/status')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    // Aqui validamos se o endpoint realmente devolve um objeto com informações úteis
    expect(response.body).toBeInstanceOf(Object);

    // Se a sua rota de status devolve chaves específicas (ex: "uptime", "monitorsCount"),
    // você pode testá-las explicitamente. Exemplo:
    // expect(response.body).toHaveProperty('uptime');
  });
});
