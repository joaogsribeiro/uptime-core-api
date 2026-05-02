import { Router } from 'express';
import MonitorController from '../controllers/MonitorController.js';
import authMiddleware from '../middlewares/auth.js';

const routes = new Router();

routes.use(authMiddleware);

routes.post('/', MonitorController.create);
routes.get('/', MonitorController.index);
routes.get('/:id', MonitorController.show);
routes.put('/:id', MonitorController.update);
routes.delete('/:id', MonitorController.delete);

export default routes;