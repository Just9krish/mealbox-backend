import { authMiddleware } from '../middleware/index.js';
import { groupController } from '../controllers/index.js';

const prefix = '/groups';

export default function registerGroupRoutes(app) {
  app.post(prefix, authMiddleware, groupController.createGroup);
  app.post(`${prefix}/join`, authMiddleware, groupController.joinGroup);
  app.post(
    `${prefix}/:groupId/items`,
    authMiddleware,
    groupController.addGroupItem
  );
  app.delete(`${prefix}/:groupId`, authMiddleware, groupController.deleteGroup);
}
