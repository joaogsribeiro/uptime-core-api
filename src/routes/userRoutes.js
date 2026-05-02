import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import authMiddleware from '../middlewares/auth.js';

const routes = new Router();

// Aplica o middleware globalmente para TODAS as rotas deste arquivo
routes.use(authMiddleware);

// Rotas Protegidas (A regra de Admin x Próprio Usuário fica dentro do Controller)
routes.get('/', UserController.index);
routes.get('/:id', UserController.show);
routes.put('/:id', UserController.update);
routes.delete('/:id', UserController.delete);

export default routes;