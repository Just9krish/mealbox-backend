import { Schema, model } from 'mongoose';
import { ACCOUNT_STATUS, GENDER } from '../constant.js';

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: Object.values(GENDER) },
    profilePicture: { type: String },
    firstLogin: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const UserModel = model('User', UserSchema);
export default UserModel;
