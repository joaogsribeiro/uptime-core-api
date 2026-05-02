import { Router } from 'express';
import SessionController from '../controllers/SessionController.js';

const routes = new Router();

// Rota pública para login (POST /api/auth/login)
routes.post('/login', SessionController.create);

// TODO: Implementar rota de recuperação de senha futuramente
// routes.post('/recover-password', PasswordController.store);

export default routes;