const router = require('express').Router();

const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const bookingsRouter = require('./bookings.js');
const reviewsRouter = require('./reviews.js');
const spotImagesRouter = require('./spot-images.js');
const reviewImagesRouter = require('./review-images.js');

const { restoreUser } = require("../../utils/auth.js");

// Middleware to restore user session
router.use(restoreUser);

// Global routes for session, users, and spots
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);

// Global routes for bookings and reviews
router.use('/bookings', bookingsRouter);
router.use('/reviews', reviewsRouter);

router.use('/spot-images', spotImagesRouter);
router.use('/review-images', reviewImagesRouter);

module.exports = router;
