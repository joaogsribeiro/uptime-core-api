import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

class SessionController {
  async create(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      // 1. Verifica se o e-mail existe no banco
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Retornamos genérico para não vazar a informação de que o e-mail existe ou não
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      }

      // 2. Verifica se a senha bate com o hash (operação custosa e segura)
      const checkPassword = await bcrypt.compare(password, user.password_hash);

      if (!checkPassword) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      }

      // 3. Geração do Token JWT
      const { id, name, role } = user;

      // Assina o token embutindo o ID e a Role (essencial para a regra de Admin no futuro)
      const token = jwt.sign(
        { id, role },
        process.env.JWT_SECRET, // Essa chave deve estar no seu arquivo .env
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      return res.status(200).json({
        user: { id, name, email, role },
        token,
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new SessionController();
