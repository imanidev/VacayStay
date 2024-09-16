const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { ValidationError } = require("sequelize");
const { environment } = require("./config");
const isProduction = environment === "production";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

app.use(routes); // Connect all the routes

// Catch unhandled requests
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = "Validation error";
    err.errors = errors;
  }
  next(err);
});

// Error formatting
/*
formatting all the errors before returning a JSON response. It will include the error message, the error messages as a JSON object with key-value pairs, and the error stack trace (if the environment is in development) with the status code of the error message.
*/
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);

  if (res.status === 401) {
    res.status(401).json({
      message: "Invalid Credentials",
    });
  }
  if (isProduction) {
    res.json({
      message: err.message,
      errors: err.errors,
    });
  } else {
    res.json({
      title: err.title || "Server Error",
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    });
  }
});

module.exports = app;
