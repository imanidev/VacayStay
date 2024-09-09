// backend/routes/api/index.js
const router = require("express").Router();

// Test route for API
router.post("/test", function (req, res) {
  res.json({ requestBody: req.body }); // Responds with the request body as JSON
});

module.exports = router;
