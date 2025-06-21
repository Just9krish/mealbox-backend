import { ACCOUNT_STATUS } from '../constant';
import { catchAsyncErrorMiddleware } from '../middleware';
import { UserModel } from '../models';
import { hashService } from '../services';
import { sendResponse } from '../utils';

export const loginUser = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || password) {
    return sendResponse({
      code: 400,
      message: 'Invalid email or password',
      res,
      status: false,
    });
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
        profilePicture: 1,
        firstLogin: 1,
        isProfileComplete: 1,
        accountStatus: 1,
      },
    },
  ]);

  if (!user) {
    return sendResponse({
      code: 400,
      message: 'Invalid credentials',
      res,
      status: false,
    });
  }

  if (user.accountStatus === ACCOUNT_STATUS.RETAINED) {
    return sendResponse({
      code: 403,
      message: 'ACCOUNT_RETAINED',
      res,
      status: false,
    });
  }

  const isPasswordValid = await hashService.verifyPassword(
    password,
    user.password
  );
  if (!isPasswordValid) {
    return sendResponse({
      code: 400,
      message: 'Invalid credentials',
      res,
      status: false,
    });
  }

  const token = tokenService.createToken({
    email: user.email,
    _id: user._id,
  });

  sendResponse({
    code: 200,
    message: 'Login successful',
    res,
    status: true,
    data: {
      token,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        profilePicture: user.profilePicture,
        firstLogin: user.firstLogin,
        isProfileComplete: user.isProfileComplete,
        accountStatus: user.accountStatus,
      },
      isProfileComplete: user.isProfileComplete,
    },
  });
});
