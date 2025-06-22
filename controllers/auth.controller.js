import {
  ACCESS_TOKEN_SECRET,
  ACCOUNT_STATUS,
  REFRESH_TOKEN_SECRET,
} from '../constant.js';
import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler } from '../utils/index.js';
import { hashService, tokenService } from '../services/index.js';
import { UserModel } from '../models/index.js';

const loginUser = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || password) {
    return next(new ErrorHandler('Invalid credentials', 400));
  }

  const [user] = await Model.UserModel.aggregate([
    { $match: { email } },
    {
      $project: {
        email: 1,
        password: 1,
        name: 1,
        phone: 1,
        gender: 1,
        profilePicture: 1,
        firstLogin: 1,
        isProfileComplete: 1,
        accountStatus: 1,
      },
    },
  ]);

  if (!user) {
    return next(new ErrorHandler('Invalid credentials', 400));
  }

  if (user.accountStatus === ACCOUNT_STATUS.RETAINED) {
    return next(new ErrorHandler('Account Retained', 403));
  }

  const isPasswordValid = await hashService.hashPassword(
    password,
    user.password
  );
  if (!isPasswordValid) {
    return next(new ErrorHandler('Invalid credentials', 400));
  }

  const accessToken = tokenService.createAccessToken(
    { _id: user._id, email: user.email },
    ACCESS_TOKEN_SECRET
  );

  const refreshToken = tokenService.createRefreshToken(
    { _id: user._id, email: user.email },
    REFRESH_TOKEN_SECRET
  );

  sendResponse({
    code: 200,
    message: user.firstLogin ? 'FIRST_LOGIN' : 'Login successful',
    res,
    status: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
      },
      accountStatus: user.accountStatus,
      firstLogin: user.firstLogin,
      isProfileComplete: user.isProfileComplete,
    },
  });
});

const registerUser = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { email, password, name, phone, gender } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Missing required fields', 400));
  }

  const [user] = await UserModel.aggregate([
    { $match: { email } },
    {
      $project: {
        email: 1,
        password: 1,
        name: 1,
        phone: 1,
        gender: 1,
      },
    },
  ]);

  if (user) {
    return next(new ErrorHandler('User already exists', 400));
  }

  const hashedPassword = await Service.hashService.hashPassword(password);

  const newUser = await Model.UserModel.create({
    email,
    password: hashedPassword,
    name,
    phone,
    gender,
  });

  sendResponse({
    code: 201,
    message: 'User created successfully',
    res,
    status: true,
    data: {
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      gender: newUser.gender,
      profilePicture: newUser.profilePicture,
      isProfileComplete: newUser.isProfileComplete,
    },
  });
});

export default {
  loginUser,
  registerUser,
};
