import registerAuthRoutes from './auth.routes.js';
import registerCategoryRoutes from './category.routes.js';
import registerVendorRoutes from './vendor.routes.js';
import registerProductRoutes from './product.routes.js';
import registerCartRoutes from './cart.routes.js';
import registerGroupRoutes from './group.routes.js';

export default function registerRoutes(app) {
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerVendorRoutes(app);
  registerProductRoutes(app);
  registerCartRoutes(app);
  registerGroupRoutes(app);
  // registerOrderRoutes(app);
}
