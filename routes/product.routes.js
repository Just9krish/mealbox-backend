import { productController } from '../controllers/index.js';

const prefix = '/products';

export default function registerProductRoutes(app) {
  // Create a new product with variants
  app.post(prefix, productController.createProduct);

  // Get all products with advanced filtering and pagination
  app.get(prefix, productController.getAllProducts);

  // Get product statistics
  app.get(`${prefix}/stats`, productController.getProductStats);

  // Get products by vendor
  app.get(`${prefix}/vendor/:vendorId`, productController.getProductsByVendor);

  // Get product by slug (SEO-friendly URL)
  app.get(`${prefix}/slug/:slug`, productController.getProductBySlug);

  // Get product by ID with complete details
  app.get(`${prefix}/:id`, productController.getProductById);

  // Update product
  app.put(`${prefix}/:id`, productController.updateProduct);

  // Delete product (soft delete)
  app.delete(`${prefix}/:id`, productController.deleteProduct);

  // Toggle product status
  app.patch(
    `${prefix}/:id/toggle-status`,
    productController.toggleProductStatus
  );
}
