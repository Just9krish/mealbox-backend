// hash.js

/**
 * This module provides functions to hash passwords and verify hashed passwords.
 * It uses bcryptjs for hashing and optionally crypto for additional operations.
 */

import bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies if a password matches a hashed password.
 * @param {string} password - The password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - True if the password matches, false otherwise.
 */
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export default {
  hashPassword,
  verifyPassword,
};
