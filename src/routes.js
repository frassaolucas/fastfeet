import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import CourierController from './app/controllers/CourierController';
import CourierDeliveriesController from './app/controllers/CourrierDeliveriesController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryStartController from './app/controllers/DeliveryStartController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/couriers/:id/deliveries', CourierDeliveriesController.index);

routes.put(
  '/couriers/:id/deliveries/:delivery_id/start',
  DeliveryStartController.update
);

// NEED TO BE AUTHENTICATED AFTER THIS LINE
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/recipients', RecipientController.store);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

export default routes;
