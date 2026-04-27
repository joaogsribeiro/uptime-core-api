import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

class UserController {
  async create(req, res) {
    try {
      const { name, email, password } = req.body;

      // 1. Validação básica
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
      }

      // 2. Verificar se o usuário já existe
      const userExists = await prisma.user.findUnique({
        where: { email }
      });

      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      // 3. Criptografar a senha (Hash)
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // 4. Criar o usuário no banco (omitindo a senha na resposta)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
          // password_hash NÃO é retornado por segurança
        }
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new UserController();