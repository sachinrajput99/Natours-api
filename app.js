const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Set Pug as the templating engine
app.set('view engine', 'pug');

// Define the views directory
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(`${__dirname}/public`)); //all static asset will be served form public folder
// Use Helmet for setting security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow resources from the same origin
        scriptSrc: ["'self'", 'https://unpkg.com'], // Allow scripts from self and unpkg
        styleSrc: [
          "'self'",
          'https://unpkg.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'"
        ], // Adjust as needed for styles
        imgSrc: [
          "'self'",
          'data:',
          'https://*.tile.openstreetmap.org',
          'https://*.tile.openstreetmap.fr',
          'https://*.openstreetmap.org',
          'https://unpkg.com'
        ],

        connectSrc: ["'self'", 'ws://localhost:3000', 'ws://127.0.0.1:3000'] // Allow WebSocket connections
        // Add other directives as needed
      }
    }
  })
);
// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit request from same ip
const limiter = rateLimit({
  max: 100, // Maximum number of requests
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  message: 'Too many requests from this IP, please try again in an hour.'
});
app.use('/api', limiter);

// app.use(express.json());
// body parser reading data from body to req.body
// Body parser with size limit
app.use(express.json({ limit: '10kb' })); // Limit incoming JSON body size
app.use(cookieParser()); // Limit incoming JSON body size

// Middleware for sanitizing NoSQL queries
app.use(mongoSanitize()); //remove $ from mongo db query-

// Middleware for sanitizing XSS attacks
app.use(xssClean()); //remove html <,>  symbol

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'averageRating',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Data sanitization against NoSQL query Attack
// Data sanitization against XSS Attack
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

// 3) ROUTES

app.use('/', viewRouter); //view router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter); //earlier it was reviewRoutes

//for all invalid routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`
  // });
  ////////////////error normally which out using class//////////////
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);//calls the global error middleware
  ///////////////error using global class
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404)); //this calls the global error handling middleware
  // this sets the message and statusCode and status  on error object
});

//global error middleware
app.use(globalErrorHandler);

module.exports = app;
