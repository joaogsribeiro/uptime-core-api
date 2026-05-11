import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Integração: Autenticação (Login)', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();

    // Injetamos um usuário diretamente no banco para podermos testar o login
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('senha123', salt);

    await prisma.user.create({
      data: {
        name: 'Usuário de Login',
        email: 'login@exemplo.com',
        password_hash,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve autenticar com credenciais corretas e retornar um token JWT', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'login@exemplo.com',
      password: 'senha123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('login@exemplo.com');
  });

  it('não deve autenticar com senha incorreta', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'login@exemplo.com',
      password: 'senha_errada',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('não deve autenticar com um e-mail não cadastrado', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'fantasma@exemplo.com',
      password: 'senha123',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
