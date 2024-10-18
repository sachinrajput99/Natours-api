class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //whatever we pass into parent class it becomes message
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //checks for operational error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
