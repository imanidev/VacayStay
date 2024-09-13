const router = require("express").Router();
const spotsRouter = require("./spots.js");
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const reviewsRouter = require("./reviews.js");
const bookingsRouter = require("./bookings.js");
const spotimagesRouter = require("./spot-images.js");
const reviewimagesRouter = require("./review-images.js");
const { restoreUser } = require("../../utils/auth.js");
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spotsRouter);

router.use("/reviews", reviewsRouter);

router.use("/bookings", bookingsRouter);

router.use("/spot-images", spotimagesRouter);

router.use("/review-images", reviewimagesRouter);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;

