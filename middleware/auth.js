import * as Utils from '../utils/index.js';
import { tokenService } from '../services/index.js';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constant.js';

/**
 * Verifies the Bearer access-token.
 * If the access-token is expired but a valid refresh-token is present,
 * a new access-token is minted and returned in `x-access-token`.
 *
 *  •  Authorization: Bearer <accessToken>
 *  •  x-refresh-token: <refreshToken>
 */
export default async function authMiddleware(req, res, next) {
  try {
    /* 1. ---------- Extract headers ---------- */
    const authHeader = req.headers.authorization || '';
    const refreshHeader = req.headers['x-refresh-token'] || '';

    const hasBearer = authHeader.startsWith('Bearer ');
    const accessToken = hasBearer ? authHeader.split(' ')[1] : null;
    const refreshToken = refreshHeader || null;

    /* 2. ---------- Access token must exist ---------- */
    if (!accessToken) {
      return next(new Utils.ErrorHandler('Unauthorized: No access token', 401));
    }

    /* 3. ---------- Verify access token ---------- */
    try {
      const decoded = tokenService.decodeToken(
        accessToken,
        ACCESS_TOKEN_SECRET
      );
      req.user = decoded; // { _id, email, ... }
      return next();
    } catch (err) {
      // Token expired OR invalid
      if (!refreshToken) {
        return next(new ErrorHandler('Unauthorized: Invalid token', 401));
      }
    }

    /* 4. ---------- Try refresh-token flow ---------- */
    try {
      const decodedRefresh = tokenService.decodeToken(
        refreshToken,
        REFRESH_TOKEN_SECRET
      );

      // Optional: check refresh token against a DB allow-list here.

      const newAccessToken = tokenService.createAccessToken(
        { _id: decodedRefresh._id, email: decodedRefresh.email },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        }
      );

      res.setHeader('x-access-token', newAccessToken);
      req.user = decodedRefresh;
      return next();
    } catch {
      return next(new ErrorHandler('Unauthorized: Invalid refresh token', 401));
    }
  } catch (err) {
    return next(new ErrorHandler('Unauthorized', 401));
  }
}
