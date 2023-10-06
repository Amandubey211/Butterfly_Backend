const NotFound = (req, res, next) => {
  const error = new Error(`NOT FOUND - ${req.OriginalUrl}`);
  res.status(400);
  next(error);
};

const ErrorHandler = (err, req, res, next) => {
  const StatusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(StatusCode).json({
    message: err.message,
  });
};

module.exports = { NotFound, ErrorHandler };
