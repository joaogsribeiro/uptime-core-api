import { Router } from 'express';
import PasswordController from '../controllers/PasswordController.js';
import SessionController from '../controllers/SessionController.js';
import UserController from '../controllers/UserController.js';

const routes = new Router();

// Rotas Públicas
routes.post('/register', UserController.create);
routes.post('/login', SessionController.create);

// Rotas de recuperação
routes.post('/forgot-password', PasswordController.forgotPassword);
routes.post('/reset-password', PasswordController.resetPassword);

export default routes;
