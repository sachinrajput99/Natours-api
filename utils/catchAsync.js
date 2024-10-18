module.exports = fn => {
  return (req, res, next) => {
    //accept a asyncfunction as a parameter and return function
    fn(req, res, next).catch(next); //if error it calls the global error middleware
  };
};
// module.exports = fn => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };
