import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import mailer from '../config/mail.js';

class PasswordController {
  // 1. Solicita a recuperação (Gera token e envia e-mail)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Retornamos 200 OK mesmo com erro para evitar "Email Enumeration" (vazamento de dados)
        return res
          .status(200)
          .json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
      }

      // Gera um token aleatório de 20 caracteres em formato hexadecimal
      const token = crypto.randomBytes(20).toString('hex');

      // Define a expiração para 1 hora a partir de agora
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      // Envio do e-mail
      await mailer.sendMail({
        to: email,
        from: '"UptimeCore Suporte" <suporte@uptimecore.com>',
        subject: 'Recuperação de Senha',
        html: `<p>Você solicitou uma recuperação de senha.</p>
               <p>Utilize o token abaixo para redefinir sua senha:</p>
               <h3>${token}</h3>
               <p>Este token expira em 1 hora.</p>`,
      });

      return res
        .status(200)
        .json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
    } catch (error) {
      console.error('Erro no forgotPassword:', error);
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor ao tentar recuperar a senha.' });
    }
  }

  // 2. Redefine a senha (Valida token e atualiza hash)
  async resetPassword(req, res) {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'E-mail, token e nova senha são obrigatórios.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }

      // Validações de integridade do token
      if (token !== user.passwordResetToken) {
        return res.status(400).json({ error: 'Token inválido.' });
      }

      const now = new Date();
      if (now > user.passwordResetExpires) {
        return res.status(400).json({ error: 'Token expirado. Solicite uma nova recuperação.' });
      }

      // Encripta a nova senha
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      // Atualiza o banco e limpa os campos de recuperação
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return res.status(200).json({ message: 'Senha atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro no resetPassword:', error);
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor ao tentar redefinir a senha.' });
    }
  }
}

export default new PasswordController();
