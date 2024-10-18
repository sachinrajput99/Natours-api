const mongoose = require('mongoose');
const dotenv = require('dotenv');

//  unhandled exception
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  // server.close(() => {
  //   process.exit(1);
  // });
  process.exit(1); //we must have to close the application in uncaughtException
});
dotenv.config({ path: './config.env' });
const app = require('./app');

//mongoose connection
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
  })
  .then(() => {
    // console.log(conn.connection, 'connection made succesfully');
    console.log('connection made succesfully');
  });
//tour schema

// //tour creation
// const testTour = new Tour({ name: 'rahul', rating: 4, price: 45 });
// testTour.save().then(doc => console.log(doc));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ERRORS outside express : unhandled rejection(connection error from mongoose)
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! SHUTTING down...');
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);
