// backend/routes/api/index.js
const router = require("express").Router();
const spotsRouter = require("./spots.js");
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const reviewsRouter = require("./reviews.js");
const bookingsRouter = require("./bookings.js");

const { restoreUser } = require("../../utils/auth.js");
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spotsRouter);

router.use("/reviews", reviewsRouter);

router.use("/bookings", bookingsRouter);

router.use("/images", spotimagesRouter);


router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;

// router.post("/test", function (req, res) {
//   res.json({ requestBody: req.body }); // Responds with the request body as JSON
// });

module.exports = router;
