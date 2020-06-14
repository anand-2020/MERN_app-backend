const AppError = require('./../utils/appError');

const castErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const duplicateFieldsDB = err => {
  let value;
  if(err.keyValue.username) value=err.keyValue.username;
  if(err.keyValue.email) value=err.keyValue.email;
  

  const message = ` ${value} not available. Please use another value!`;
  return new AppError(message, 400);
};


const validationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again', 401)
 
const handleExpiredToken = () => new AppError('Token expired. Login in again', 401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    
  } else {
    
   console.error('ERROR:',err);

    
    res.status(500).json({
      status: 'error',
      message: 'Something went  wrong! boom'
    });
  }
};

module.exports = (err, req, res, next) => {

  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production ') { 
    let error = Object.assign(err);
    
    if (error.name === 'CastError') error = castErrorDB(error);
    if (error.code === 11000) error = duplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = validationErrorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJWTError();
    if(error.name === 'TokenExpiredError') error = handleExpiredToken();

    sendErrorProd(error, res);
  }
};
