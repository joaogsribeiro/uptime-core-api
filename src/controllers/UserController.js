import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

class UserController {
  async create(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
      }

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async index(req, res) {
    try {
      if (req.userRole !== 'ADMIN') {
        return res
          .status(403)
          .json({ error: 'Acesso negado. Apenas administradores podem listar usuários.' });
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      if (req.userRole !== 'ADMIN' && req.userId !== id) {
        return res.status(403).json({ error: 'Você não tem permissão para ver este perfil.' });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (req.userRole !== 'ADMIN' && req.userId !== id) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este perfil.' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { name, email },
        select: { id: true, name: true, email: true, role: true, updatedAt: true },
      });

      return res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (req.userRole !== 'ADMIN' && req.userId !== id) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar este perfil.' });
      }

      await prisma.user.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new UserController();
