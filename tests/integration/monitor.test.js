import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Gestão de Monitores (Monitors)', () => {
  let userA, userB;
  let tokenA, tokenB;
  let monitorA;

  beforeAll(async () => {
    await prisma.monitor.deleteMany();
    await prisma.user.deleteMany();

    // 1. Criação de dois usuários distintos
    userA = await prisma.user.create({
      data: { name: 'Alice', email: 'alice@exemplo.com', password_hash: 'hash' },
    });
    userB = await prisma.user.create({
      data: { name: 'Bob', email: 'bob@exemplo.com', password_hash: 'hash' },
    });

    // 2. Geração dos tokens independentes
    tokenA = jwt.sign({ id: userA.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenB = jwt.sign({ id: userB.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 3. Pré-criação de um monitor pertencente exclusivamente à Alice (User A)
    monitorA = await prisma.monitor.create({
      data: {
        name: 'API de Pagamentos (Alice)',
        url: 'https://pagamentos.exemplo.com',
        interval_minutes: 5,
        userId: userA.id, // Amarrado à Alice
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- BLOCO 1: CRIAÇÃO E LISTAGEM ISOLADA ---

  it('deve criar um novo monitor para o usuário autenticado', async () => {
    const response = await request(app)
      .post('/api/monitors')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Blog da Alice',
        url: 'https://blog.alice.com',
        interval_minutes: 10,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Blog da Alice');
    expect(response.body.userId).toBe(userA.id);
  });

  it('deve listar APENAS os monitores do próprio usuário', async () => {
    const response = await request(app)
      .get('/api/monitors')
      .set('Authorization', `Bearer ${tokenB}`); // Bob pedindo a lista dele

    expect(response.status).toBe(200);
    // Bob não criou nenhum monitor ainda, a lista dele deve vir vazia
    // Ele NUNCA deve receber os monitores da Alice
    expect(response.body.length).toBe(0);
  });

  // --- BLOCO 2: PROTEÇÃO CONTRA ROUBO DE RECURSOS ---

  it('não deve permitir que o Usuário B atualize o monitor do Usuário A (403 ou 404)', async () => {
    const response = await request(app)
      .put(`/api/monitors/${monitorA.id}`)
      .set('Authorization', `Bearer ${tokenB}`) // Bob tentando editar o monitor da Alice
      .send({
        name: 'Monitor Hackeado',
      });

    // Dependendo de como você programou, a API pode retornar 404 (Não encontrou para este usuário)
    // ou 403 (Acesso negado). Ambas as abordagens são seguras.
    expect([403, 404]).toContain(response.status);

    // Garantia dupla: Vai no banco checar se o nome continuou intacto
    const checkDb = await prisma.monitor.findUnique({ where: { id: monitorA.id } });
    expect(checkDb.name).toBe('API de Pagamentos (Alice)');
  });

  it('não deve permitir que o Usuário B delete o monitor do Usuário A', async () => {
    const response = await request(app)
      .delete(`/api/monitors/${monitorA.id}`)
      .set('Authorization', `Bearer ${tokenB}`); // Bob tentando deletar

    expect([403, 404]).toContain(response.status);

    // Garantia dupla: O monitor da Alice precisa continuar existindo
    const checkDb = await prisma.monitor.findUnique({ where: { id: monitorA.id } });
    expect(checkDb).not.toBeNull();
  });

  // --- BLOCO 3: FLUXO FELIZ DE MANUTENÇÃO ---

  it('deve permitir que a dona do monitor (Alice) delete o próprio registro', async () => {
    const response = await request(app)
      .delete(`/api/monitors/${monitorA.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect([200, 204]).toContain(response.status);

    const checkDb = await prisma.monitor.findUnique({ where: { id: monitorA.id } });
    expect(checkDb).toBeNull();
  });
});
