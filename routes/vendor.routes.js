import { vendorController } from '../controllers/index.js';

const prefix = '/vendors';

export default function registerVendorRoutes(app) {
  // Create a new vendor
  app.post(prefix, vendorController.createVendor);

  // Get all vendors with pagination and search
  app.get(prefix, vendorController.getAllVendors);

  // Get vendor statistics
  app.get(`${prefix}/stats`, vendorController.getVendorStats);

  // Get vendor by ID
  app.get(`${prefix}/:id`, vendorController.getVendorById);

  // Update vendor
  app.put(`${prefix}/:id`, vendorController.updateVendor);

  // Delete vendor
  app.delete(`${prefix}/:id`, vendorController.deleteVendor);

  // Toggle vendor status
  app.patch(`${prefix}/:id/toggle-status`, vendorController.toggleVendorStatus);
}
