import { Router } from 'express';
import UserController from '../controllers/UserController.js';

const routes = new Router();

// Rota pública para cadastro
routes.post('/', UserController.create);

export default routes;