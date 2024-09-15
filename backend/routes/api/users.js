const express = require("express");

const {
  setTokenCookie,
  requireAuth,
  restoreUser,
} = require("../../utils/auth");
const { User } = require("../../db/models");
const router = express.Router();

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
  check("email").isEmail().withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("username")
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username")
    .isLength({ max: 30 })
    .withMessage("Please provide a username with at most 30 characters."),
  handleValidationErrors,
];

const validateLogin = [
  check("credential")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Please provide a valid email or username."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
  handleValidationErrors,
];

// Sign up route
router.post("/", validateSignup, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;

    // Body Validation
    if (!email || !firstName || !lastName) {
      const err = new Error("Validation Error");
      err.status = 400;
      err.message = "Validation Error";
      err.errors = [];

      if (!email) err.errors.push("Invalid email");
      if (!firstName) err.errors.push("First Name is required");
      if (!lastName) err.errors.push("Last Name is required");
      return next(err);
    }

    const foundUser = await User.findOne({ where: { email: email } });

    if (!foundUser) {
      const user = await User.signup({
        firstName,
        lastName,
        email,
        username,
        password,
      });

      const token = await setTokenCookie(res, user);
      user.dataValues["token"] = token;

      return res.json({ user });
    } else {
      const err = new Error("User already exists");
      err.status = 403;
      err.errors = ["User with that email already exists"];
      return next(err);
    }
  } catch (error) {
    return next(error);
  }
});

// Login
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Validation Error");
      err.status = 400;
      err.message = "Validation Error";
      err.errors = [];

      if (!email) err.errors.push("Email is required");
      if (!password) err.errors.push("Password is required");
      return next(err);
    }

    const user = await User.login({ email, password });

    if (!user) {
      const err = new Error("Invalid Credentials");
      err.status = 401;
      err.message = "Invalid Credentials";
      return next(err);
    }

    const token = await setTokenCookie(res, user);
    user.dataValues["token"] = token; // Sends a JWT Cookie
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

// Get the Current User
router.get("/", [requireAuth, restoreUser], async (req, res) => {
  const { user } = req;

  const token = await setTokenCookie(res, user);
  user.dataValues["token"] = token;

  return res.json({ user });
});

module.exports = router;
