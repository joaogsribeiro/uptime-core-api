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

  // Listar todos os usuários (GET /api/users)
  async index(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Buscar um usuário específico (GET /api/users/:id)
  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Atualizar usuário (PUT /api/users/:id)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // Verifica se o usuário existe antes de atualizar
      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { name, email },
        select: { id: true, name: true, email: true, role: true, updatedAt: true }
      });

      return res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Deletar usuário (DELETE /api/users/:id)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await prisma.user.delete({ where: { id } });
      
      // 204 No Content é o padrão RESTful para deleções bem-sucedidas
      return res.status(204).send(); 
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new UserController();