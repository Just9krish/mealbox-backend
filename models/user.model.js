import mongoose from 'mongoose';
const { Schema } = mongoose;

const GENDER = ['MALE', 'FEMALE', 'OTHER'];
const ACCOUNT_STATUS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: String,
    name: String,
    phone: String,
    gender: { type: String, enum: GENDER },
    profilePicture: String,
    first_login: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ACCOUNT_STATUS, default: 'ACTIVE' },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
