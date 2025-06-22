// token.js

/**
 * This module provides functions to create and decode JWT tokens.
 * It uses the jsonwebtoken library to handle token operations.
 */

import jwt from 'jsonwebtoken';

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

/**
 * Creates an access token.
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {Object} [options] - Optional settings for token creation, including expiresIn.
 * @returns {string} - The generated access token.
 */
function createAccessToken(payload, secret, options = { expiresIn: '15m' }) {
  return jwt.sign(payload, secret, options);
}

/**
 * Creates a refresh token.
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {Object} [options] - Optional settings for token creation, including expiresIn.
 * @returns {string} - The generated refresh token.
 */
function createRefreshToken(payload, secret, options = { expiresIn: '7d' }) {
  return jwt.sign(payload, secret, options);
}

export default {
  decodeToken,
  createAccessToken,
  createRefreshToken,
};
