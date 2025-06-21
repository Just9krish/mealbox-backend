/**
 * Sends a response with the specified status, code, data, and message.
 * If the data is not an array, it will be wrapped in an array before sending the response.
 *
 * @param {object} options - The response options.
 * @param {object} options.res - The response object.
 * @param {boolean} options.status - The status to send in the response wheither true or false.
 * @param {number} options.code - The status code to send in the response.
 * @param {any} options.data - The data to send in the response.
 * @param {string} options.message - The message to send in the response.
 */
const sendResponse = ({ res, status, code, data, message }) => {
  // Wrap data in an array if it's not already
  res.status(code).json({
    success: status,
    code,
    message,
    data,
  });
};

module.exports = sendResponse;
