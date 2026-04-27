import { Router } from 'express';
import MonitorController from '../controllers/MonitorController.js';

const routes = new Router();

routes.post('/', MonitorController.create);
routes.get('/', MonitorController.index);
routes.get('/:id', MonitorController.show);
routes.put('/:id', MonitorController.update);
routes.delete('/:id', MonitorController.delete);

export default routes;