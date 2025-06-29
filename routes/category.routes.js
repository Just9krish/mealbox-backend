import { categoryController } from '../controllers/index.js';

const prefix = '/categories';

export default function registerCategoryRoutes(app) {
  // Create a new category
  app.post(prefix, categoryController.createCategory);

  // Get all categories with pagination, search, and vendor filtering
  app.get(prefix, categoryController.getAllCategories);

  // Get category statistics
  app.get(`${prefix}/stats`, categoryController.getCategoryStats);

  // Get categories by vendor ID
  app.get(
    `${prefix}/vendor/:vendorId`,
    categoryController.getCategoriesByVendor
  );

  // Get category by ID
  app.get(`${prefix}/:id`, categoryController.getCategoryById);

  // Update category
  app.put(`${prefix}/:id`, categoryController.updateCategory);

  // Delete category
  app.delete(`${prefix}/:id`, categoryController.deleteCategory);

  // Toggle category status
  app.patch(
    `${prefix}/:id/toggle-status`,
    categoryController.toggleCategoryStatus
  );

  // Get all categories as a tree grouped by vendor
  app.get(`${prefix}/tree`, categoryController.getAllCategoriesTree);

  // Get categories as a tree for a specific vendor
  app.get(
    `${prefix}/vendor/:vendorId/tree`,
    categoryController.getCategoriesByVendorTree
  );
}
