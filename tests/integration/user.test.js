// tests/integration/user.test.js
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Criação de Usuários', () => {
  // Limpa a tabela antes de iniciar a bateria de testes deste bloco
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  // Fecha a conexão com o banco ao finalizar para não vazar memória no Jest
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve criar um novo usuário com sucesso e retornar o ID', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Usuário de Teste',
      email: 'teste.jest@exemplo.com',
      password: 'senha_super_segura',
    });

    // Esperamos que o status HTTP seja 201 Created
    expect(response.status).toBe(201);

    // O corpo da resposta deve conter o ID gerado pelo banco
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Usuário de Teste');
    expect(response.body.email).toBe('teste.jest@exemplo.com');

    // Auditoria de segurança: a senha nua ou o hash NUNCA devem voltar no JSON
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('não deve permitir a criação de um usuário com e-mail já cadastrado', async () => {
    // Tenta criar um usuário com o mesmo e-mail do teste anterior
    const response = await request(app).post('/api/auth/register').send({
      name: 'Clone do Teste',
      email: 'teste.jest@exemplo.com',
      password: 'outrasenha_123',
    });

    // Esperamos que a API barre a requisição com status de erro do cliente (400)
    expect(response.status).toBe(400);

    // Esperamos que a API retorne uma mensagem de erro clara
    expect(response.body).toHaveProperty('error');
  });
});
