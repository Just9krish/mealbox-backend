import registerAuthRoutes from './auth.routes.js';
import registerCategoryRoutes from './category.routes.js';
import registerVendorRoutes from './vendor.routes.js';

export default function registerRoutes(app) {
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerVendorRoutes(app);
}
