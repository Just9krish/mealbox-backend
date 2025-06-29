import registerAuthRoutes from './auth.routes.js';
import registerCategoryRoutes from './category.routes.js';
import registerVendorRoutes from './vendor.routes.js';
import registerProductRoutes from './product.routes.js';
import registerCartRoutes from './cart.routes.js';

export default function registerRoutes(app) {
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerVendorRoutes(app);
  registerProductRoutes(app);
  registerCartRoutes(app);
  // registerOrderRoutes(app);
}
