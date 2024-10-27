const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach((error) => {
      errors[error.param] = error.msg;
    });

    // Respond directly without adding title or stack
    return res.status(400).json({
      message: 'Bad Request',
      errors: errors
    });
  }
  next();
};


module.exports = {
  handleValidationErrors
};
