import { Router } from 'express';
import SessionController from '../controllers/SessionController.js';
import UserController from '../controllers/UserController.js'; // Importamos o controller aqui

const routes = new Router();

// Rotas Públicas
routes.post('/register', UserController.create);
routes.post('/login', SessionController.create);

export default routes;