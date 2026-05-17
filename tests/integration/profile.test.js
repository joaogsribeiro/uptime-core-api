import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Gestão de Perfis (Users)', () => {
  let regularUser;
  let adminToken;
  let regularToken;

  beforeAll(async () => {
    // Limpa a tabela para garantir isolamento
    await prisma.user.deleteMany();

    const password_hash = await bcrypt.hash('senha_segura', 8);

    // 1. Criação do Usuário Comum
    regularUser = await prisma.user.create({
      data: {
        name: 'Usuário Padrão',
        email: 'padrao@exemplo.com',
        password_hash,
        // Caso o seu Prisma exija um campo de nível de acesso por padrão, ajuste aqui.
      },
    });

    // 2. Criação do Administrador
    const adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@exemplo.com',
        password_hash,
        role: 'ADMIN',
      },
    });

    // 3. Forjando os tokens localmente para otimizar a velocidade dos testes
    // Certifique-se de que o payload ({ id: ... }) reflete o que o seu authMiddleware espera.
    regularToken = jwt.sign({ id: regularUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- BLOCO 1: SEGURANÇA E AUTORIZAÇÃO ---

  it('não deve permitir acesso à listagem sem token (401 Unauthorized)', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(401);
  });

  it('deve bloquear a listagem de todos os usuários para perfil comum (403 Forbidden)', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${regularToken}`); // Injeta o token no Header

    // Assumindo que seu middleware retorna 403 para falta de permissão, ou 401. Ajuste se necessário.
    expect(response.status).toBe(403);
  });

  // --- BLOCO 2: FLUXO ADMINISTRATIVO ---

  it('deve listar todos os usuários quando autenticado como administrador (200 OK)', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2); // No mínimo o admin e o comum

    // Auditoria de segurança: A lista NUNCA deve expor senhas
    expect(response.body[0]).not.toHaveProperty('password_hash');
  });

  // --- BLOCO 3: GESTÃO DO PRÓPRIO PERFIL ---

  it('deve buscar os dados de um usuário específico por ID', async () => {
    const response = await request(app)
      .get(`/api/users/${regularUser.id}`)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(regularUser.id);
    expect(response.body.email).toBe('padrao@exemplo.com');
  });

  it('deve atualizar os dados do próprio perfil com sucesso', async () => {
    const response = await request(app)
      .put(`/api/users/${regularUser.id}`)
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        name: 'Usuário Editado',
      });

    expect(response.status).toBe(200);

    // Vai no banco garantir que a alteração realmente persistiu
    const dbCheck = await prisma.user.findUnique({ where: { id: regularUser.id } });
    expect(dbCheck.name).toBe('Usuário Editado');
  });

  it('deve deletar a própria conta com sucesso', async () => {
    const response = await request(app)
      .delete(`/api/users/${regularUser.id}`)
      .set('Authorization', `Bearer ${regularToken}`);

    // Muitas APIs retornam 204 (No Content) para exclusões, ou 200.
    expect([200, 204]).toContain(response.status);

    // Validação final: o usuário não deve mais existir no banco
    const dbCheck = await prisma.user.findUnique({ where: { id: regularUser.id } });
    expect(dbCheck).toBeNull();
  });
});
