// token.js

/**
 * This module provides functions to create and decode JWT tokens.
 * It uses the jsonwebtoken library to handle token operations.
 */

import jwt from 'jsonwebtoken';

/**
 * Creates a JWT token.
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {Object} [options] - Optional settings for token creation.
 * @returns {string} - The generated JWT token.
 */
/**
 * Creates a JWT token with optional expiration.
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {Object} [options] - Optional settings for token creation, including expiresIn.
 * @returns {string} - The generated JWT token.
 */
function createToken(payload, secret, options = {}) {
  // Ensure expiresIn can be set in options for token expiration
  return jwt.sign(payload, secret, options);
}

/**
 * Decodes a JWT token.
 * @param {string} token - The JWT token to decode.
 * @param {string} secret - The secret key to verify the token.
 * @returns {Object} - The decoded payload if the token is valid.
 * @throws {Error} - If the token is invalid or expired.
 */
function decodeToken(token, secret) {
  return jwt.verify(token, secret);
}

export default {
  createToken,
  decodeToken,
};
