const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Validation for signup
const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage('First Name is required.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage('Last Name is required.'),
  handleValidationErrors
];

// Signup route
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;

    // Check if email or username already exists
    const existingUserByEmail = await User.findOne({ where: { email } });
    const existingUserByUsername = await User.findOne({ where: { username } });

    if (existingUserByEmail || existingUserByUsername) {
      return res.status(500).json({
        message: 'User already exists',
        errors: {
          email: existingUserByEmail ? 'User with that email already exists' : undefined,
          username: existingUserByUsername ? 'User with that username already exists' : undefined
        }
      });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password);

    // Create new user
    const user = await User.create({
      email,
      username,
      hashedPassword,
      firstName,
      lastName
    });

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username
    };

    // Set the token cookie
    await setTokenCookie(res, safeUser);

    // Return the new user data
    return res.status(201).json({
      user: safeUser
    });
  }
);

// Get the current user’s profile (authentication required)
router.get('/profile', requireAuth, async (req, res) => {
  const { user } = req;

  return res.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username
    }
  });
});

// Get the current logged-in user (authentication required)
router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(200).json({
      user: null
    });
  }

  return res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username

  });
});

module.exports = router;
