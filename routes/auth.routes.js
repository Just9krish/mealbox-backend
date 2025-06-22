import { authController } from '../controllers/index.js';

const prefix = '/auth';

export default function registerAuthRoutes(app) {
  app.post(`${prefix}/register`, authController.registerUser);
  app.post(`${prefix}/login`, authController.loginUser);
}
