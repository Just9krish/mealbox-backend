/**
 * Wraps the given function with error handling using promises.
 * @param {function} theFunc - The function to be wrapped
 * @returns {function} - The wrapped function
 */
export default (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
