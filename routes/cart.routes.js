import { cartController } from '../controllers/index.js';

const prefix = '/carts';

export default function registerCartRoutes(app) {
  // Get user's cart with all items and details
  app.get(`${prefix}/user/:userId`, cartController.getUserCart);

  // Get cart summary (lightweight version)
  app.get(`${prefix}/user/:userId/summary`, cartController.getCartSummary);

  // Add item to cart
  app.post(`${prefix}/user/:userId/items`, cartController.addToCart);

  // Update cart item quantity
  app.put(
    `${prefix}/user/:userId/items/:itemId`,
    cartController.updateCartItemQuantity
  );

  // Remove item from cart
  app.delete(
    `${prefix}/user/:userId/items/:itemId`,
    cartController.removeFromCart
  );

  // Clear entire cart
  app.delete(`${prefix}/user/:userId`, cartController.clearCart);
}
