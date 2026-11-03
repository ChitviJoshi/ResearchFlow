// Builds an Error carrying an HTTP status, which error.middleware turns into the response.
module.exports = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};