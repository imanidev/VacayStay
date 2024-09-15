const express = require("express");

const {
  setTokenCookie,
  requireAuth,
  restoreUser,
} = require("../../utils/auth");
const { User } = require("../../db/models");
const router = express.Router();
const bcrypt = require("bcryptjs");

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

// Sign up route
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({ email, username, hashedPassword });

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

module.exports = router;
