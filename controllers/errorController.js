const AppError = require('../utils/appError');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again.', 401);

const handleJWTError = () =>
  new AppError('Invalid token, please login again', 401);

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((obj) => obj.message);

  const msg = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(msg, 400);
}

function handleCastErrorDB(err) {
  const msg = `invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 404);
}

function handleDuplicateErrorDB(err) {
  const msg = `Duplicate field value: ${err.errorResponse.keyValue.name}. Please use another value`;
  return new AppError(msg, 404);
}

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.error('💀', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
