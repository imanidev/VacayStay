// backend/routes/index.js
const express = require("express");
const router = express.Router();

// Import the API router
const apiRouter = require("./api");

// Connect the API router to the main router with the prefix /api
router.use("/api", apiRouter);

// Restore XSRF-TOKEN cookie route
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    "XSRF-Token": csrfToken,
  });
});

module.exports = router;
