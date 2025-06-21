import {
  SUCCESS_CODE,
  NOT_FOUND_CODE,
  LOWERCASE_ALPHABETS_REGEX,
  UPPERCASE_ALPHABETS_REGEX,
  SPECIAL_CHARACTERS,
  SPECIAL_CHARACTERS_REGEX,
  NUMBERS_REGEX,
} from '../constants';

const checkStringDataAndLength = ({
  requiredLength,
  fieldToCheck,
  variableName,
}) => {
  const isValidDataType = typeof fieldToCheck === 'string';
  const isValidLength = fieldToCheck.length < requiredLength;
  let code = SUCCESS_CODE;
  let message;
  if (!(isValidDataType && isValidLength)) {
    code = 300;
    message = isValidLength
      ? `${variableName} needs to be string`
      : `${variableName} needs to be less ${requiredLength} characters`;
  }
  return { code, message };
};

const checkForValidEnum = ({ enumToCheck, value, parameterName }) => {
  let code = SUCCESS_CODE;
  let message = `${parameterName} is valid`;
  const enumValues = Object.values(enumToCheck);

  const isFound = enumValues.find((enumValue) => enumValue === +value);
  if (isFound === undefined) {
    code = NOT_FOUND_CODE;
    message = `value provided for ${parameterName} is not valid`;
  }

  return { code, message };
};

const checkForValidArray = (arrayToCheck) => {
  let code = SUCCESS_CODE;
  let message = 'valid';
  if (typeof arrayToCheck !== 'object') {
    message = 'arrayToCheck needs to be of typeof object';
    code = NOT_FOUND_CODE;
    return { code, message };
  }
  const value = Object.values(arrayToCheck)[0];
  const isValidArray = Array.isArray(value) && value.length;
  if (!isValidArray) {
    code = NOT_FOUND_CODE;
    message = `${Object.keys(arrayToCheck)[0]} is not a valid array`;
  }
  return { code, message };
};

const passwordCharactersValidation = (password) => {
  let message = 'success';
  let code = SUCCESS_CODE;

  // check for length
  if (password.length < 8) {
    code = 400;
    message = 'Password needs to be atleast of 8 characters length';
  } else if (!LOWERCASE_ALPHABETS_REGEX.test(password)) {
    code = 400;
    message = 'Password should contain atleast lowercase aplhabet';
  } else if (!UPPERCASE_ALPHABETS_REGEX.test(password)) {
    code = 400;
    message = 'Password should contain atleast one uppercase alphabet';
  } else if (!SPECIAL_CHARACTERS_REGEX.test(password)) {
    code = 400;
    message =
      'Password should contain atleast one speacial character `~!@#$%^&*(){[}]|?/>.,<\'";:';
  } else if (!NUMBERS_REGEX.test(password)) {
    code = 400;
    message = 'Password should contain atleast one number from';
  }

  return { code, message };
};

const checkEmail = (email) => {
  const message = 'success';
  let code = SUCCESS_CODE;
  if (!email) {
    code = 400;
    message = 'email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    code = 400;
    message = 'email is invalid';
  } else {
    code = 200;
    message = 'email is valid';
  }
  return { code, message };
};

export default {
  checkStringDataAndLength,
  checkForValidEnum,
  checkForValidArray,
  passwordCharactersValidation,
  checkEmail,
};
