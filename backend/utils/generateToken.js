const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Get JWT secret from environment variables
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

module.exports = generateToken;