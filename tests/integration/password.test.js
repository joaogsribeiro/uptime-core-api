import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';
import mailer from '../../src/config/mail.js';

describe('Integração: Recuperação de Senha', () => {
  let testUser;

  beforeAll(async () => {
    // 2. O espião agora vive dentro do ciclo de vida do Jest
    jest.spyOn(mailer, 'sendMail').mockResolvedValue(true);

    await prisma.user.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('senha_antiga', salt);

    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Esquecido',
        email: 'esquecido@exemplo.com',
        password_hash,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    jest.restoreAllMocks();
  });

  // --- BLOCO 1: ESQUECI A SENHA ---

  it('deve gerar um token e simular o envio de e-mail (200 OK)', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'esquecido@exemplo.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Se o e-mail existir, um link de recuperação será enviado.');

    // Validação Estratégica: O mock do e-mail foi acionado?
    expect(mailer.sendMail).toHaveBeenCalledTimes(1);

    // Validação de Banco: O token foi salvo no usuário?
    const updatedUser = await prisma.user.findUnique({ where: { email: 'esquecido@exemplo.com' } });
    expect(updatedUser.passwordResetToken).not.toBeNull();
    expect(updatedUser.passwordResetExpires).not.toBeNull();
  });

  it('deve retornar 200 OK para e-mail inexistente, mas NÃO deve enviar e-mail', async () => {
    // Limpa a contagem do mock para este teste
    jest.clearAllMocks();

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'fantasma@exemplo.com' });

    // A resposta deve ser idêntica ao caminho feliz (Prevenção de Email Enumeration)
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Se o e-mail existir, um link de recuperação será enviado.');

    // A prova de segurança: O e-mail NUNCA deve ser disparado
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });

  // --- BLOCO 2: REDEFINIÇÃO DE SENHA ---

  it('não deve redefinir com token inválido (400 Bad Request)', async () => {
    const response = await request(app).post('/api/auth/reset-password').send({
      email: 'esquecido@exemplo.com',
      token: 'token_falso_123',
      newPassword: 'nova_senha_segura',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Token inválido.');
  });

  it('deve redefinir a senha com sucesso e limpar os tokens no banco', async () => {
    // Busca o usuário atualizado para pegar o token real gerado no primeiro teste
    const userWithToken = await prisma.user.findUnique({
      where: { email: 'esquecido@exemplo.com' },
    });

    const response = await request(app).post('/api/auth/reset-password').send({
      email: 'esquecido@exemplo.com',
      token: userWithToken.passwordResetToken,
      newPassword: 'nova_senha_segura',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Senha atualizada com sucesso.');

    // Prova de limpeza: O banco não deve mais conter o token de uso único
    const finalUser = await prisma.user.findUnique({ where: { email: 'esquecido@exemplo.com' } });
    expect(finalUser.passwordResetToken).toBeNull();
    expect(finalUser.passwordResetExpires).toBeNull();

    // Prova de criptografia: Validamos se a nova senha realmente funciona
    const passwordMatch = await bcrypt.compare('nova_senha_segura', finalUser.password_hash);
    expect(passwordMatch).toBe(true);
  });
});
