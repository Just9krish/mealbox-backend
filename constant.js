export const {
  ATLAS_USER,
  ATLAS_PASSWORD,
  ATLAS_CLUSTER,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  PAGINATION_LIMIT = 30,
  APP_NAME = 'APP_NAME',
  NODE_ENV = `${APP_NAME}-development`,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  PORT = 8000,
} = process.env;

const db = process.env.MONGO_DB || '{{app_name}}';

export const mongoConnectionString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}/${db}?retryWrites=true&w=majority`;
export const mongoConnectionStringWithoutDB = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}`;
export const mongoConnectionStringEncryption = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}/encryption-${db}?retryWrites=true`;

export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  RETAINED: 'RETAINED',
  DEACTIVATED: 'DEACTIVATED',
};

export const FOOD_TYPE = {
  VEG: 'VEG',
  NON_VEG: 'NON_VEG',
};

export const GROUP_STATUS = {
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_MODE = {
  DINE_IN: 'DINE_IN',
  PARCEL: 'PARCEL',
};

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY',
  HANDED_OFF: 'HANDED_OFF',
  CANCELLED: 'CANCELLED',
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_METHOD = {
  UPI: 'UPI',
  CARD: 'CARD',
  NETBANKING: 'NETBANKING',
  CASH: 'CASH',
};

export const SUCCESS_CODE = 200;
export const NOT_FOUND_CODE = 404;
export const FORBIDDEN_CODE = 403;

export const LOWERCASE_ALPHABETS_REGEX = /[a-z]/;
export const UPPERCASE_ALPHABETS_REGEX = /[A-Z]/;
export const SPECIAL_CHARACTERS_REGEX =
  /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
export const NUMBERS_REGEX = /[0-9]/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
