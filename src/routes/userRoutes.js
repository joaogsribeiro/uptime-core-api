import { Router } from 'express';
import UserController from '../controllers/UserController.js';

const routes = new Router();

routes.post('/', UserController.create);
routes.get('/', UserController.index);
routes.get('/:id', UserController.show);
routes.put('/:id', UserController.update);
routes.delete('/:id', UserController.delete);

export default routes;