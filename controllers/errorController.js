const AppError = require('../utils/appError');

//cast error (id value is small)
const handleCastErrorDB = err => {
  const message = `Invalid${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
//unique field
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'"])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value:${value}. Please another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data.${errors.join('.')}`;
  return new AppError(message, 400);
};
//error when token is disturbed
const handleJWTError = () =>
  new AppError('Invalid token.Please login again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired.Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    //sends the error response(code written in catch block)
    status: err.status,
    message: err.message
  });
};

const sendErrorProd = (err, res) => {
  // Operation,trusted error:send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      //sends the error response(code written in catch block)
      status: err.status,
      message: err.message
    });
    // Programming or other unknown error:don't  leak other error
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!'
    });
    console.error('💥 Unexpected Error:', err);
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //////////////not required cast error///////////
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    //unique field mongoose error
    // console.log(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.code === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.message === 'invalid signature') error = handleJWTError(error);
    if (error.message === 'jwt expired') error = handleJWTExpiredError(error);
    /////////////////////////////////////
    sendErrorProd(error, res);
  }
};
