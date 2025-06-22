import registerAuthRoutes from './auth.routes.js';
// import registerOrderRoutes from './order.routes.js';
// import registerProductRoutes from './product.routes.js';

export default function registerRoutes(app) {
  registerAuthRoutes(app);
  // registerOrderRoutes(app);
  // registerProductRoutes(app);
}
