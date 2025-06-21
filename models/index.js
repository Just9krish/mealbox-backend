import mongoose from 'mongoose';
const { Schema } = mongoose;

// Common status enums
const ACCOUNT_STATUS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];
const GENDER = ['MALE', 'FEMALE', 'OTHER'];

// Export enums for reuse
export { ACCOUNT_STATUS, GENDER };

// Export Schema for use in other models
export { Schema };
