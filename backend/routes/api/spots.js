const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Spot,
  SpotImage,
  User,
  Review,
  Sequelize,
  ReviewImage,
} = require("../../db/models");
const bookingsRouter = require("./booking");
const reviewsRouter = require("./reviews");
const { requireAuth } = requireAuth("../../utils/auth.js");

// CRUD Routes to manage Spots, SpotImages, Reviews, Bookings

router.use("/:spotId/bookings", bookingsRouter);
router.use("/:spotId/reviews", reviewsRouter);

// Get all Spots
// /api/spots
router.get("/", async (req, res, next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  // convert page and size to integers from strings
  page = parseInt(page, 10) || 1;
  size = parseInt(size, 10) || 20;

  const pagination = {
    limit: size,
    offset: (page - 1) * size,
  };

  // convert any other filter conditions
  const filterConditions = {};

  if (minLat || maxLat) {
    filterConditions.lat = {};
    if (minLat) filterConditions.lat[Op.gte] = parseFloat(minLat);
    if (maxLat) filterConditions.lat[Op.lte] = parseFloat(maxLat);
  }

  if (minLng || maxLng) {
    filterConditions.lng = {};
    if (minLng) filterConditions.lng[Op.gte] = parseFloat(minLng);
    if (maxLng) filterConditions.lng[Op.lte] = parseFloat(maxLng);
  }

  if (minPrice || maxPrice) {
    filterConditions.price = {};
    if (minPrice) filterConditions.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) filterConditions.price[Op.lte] = parseFloat(maxPrice);
  }

  try {
    const spots = await Spot.findAll({
      where: filterConditions,
      ...pagination,
    });

    // get average rating for each spot
    const spotIds = spots.map((spot) => spot.id);
    const avgRatings = await Spot.findAll({
      where: {
        spotId: {
          [Op.in]: spotIds,
        },
      },
      attributes: [
        "spotId",
        [Sequelize.fn("AVG", Sequelize.col("stars")), "avgRating"],
      ],
      group: ["spotId"],
    });

    const avgRatingsMap = avgRatings.reduce((acc, { spotId, avgRating }) => {
      acc[spotId] = parseFloat(avgRating);
      return acc;
    }, {});

    const spotsResults = spots.map((spot) => ({
      ...spot.toJSON(),
      avgRating: avgRatingsMap[spot.id] || null,
    }));

    const spotsResponse = {
      Spots: spotsResults,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
      total: spots.length,
    };
    res.json(spotsResponse);
  } catch (error) {
    next(error);
  }
});

// get all spots owned by the current user
// /api/spots/current ~ not /spots/:ownerId
router.get("/current", requireAuth, async (req, res, next) => {
  // get current user from restoreUser middleware
  //(already implemented on all routes)
  const uid = req.user.id;

  try {
    const currentUserSpots = await Spot.findAll({
      where: { ownerId: uid },
    });

    res.json(currentUserSpots);
  } catch (error) {
    next(error);
  }
});

// get details of a Spot from an id
// /api/spots/:spotId
router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;

  try {
    // Get the spot with the specified id
    // returns a Spot object or "null" to be used later
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          attributes: ["id", "url", "preview"],
          as: "SpotImages",
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
          as: "Owner",
        },
        {
          model: Review,
          attributes: [],
        },
      ],
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // get average rating for each spot
    const averageStarRatingResult = await Review.findAll({
      where: { spotId },
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("stars")), "avgStarRating"],
      ],
    });

    // get count of reviews for spot
    const numReviews = await Review.count({ where: { spotId } });

    // Extract average star rating from the result
    const avgStarRating = averageStarRatingResult
      ? averageStarRatingResult.get("avgStarRating")
      : null;

    res.json({
      id: spot.id,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      numReviews,
      avgStarRating: avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner,
    });
  } catch (error) {
    next(error);
  }
});

// Get all reviews for a spot
// /api/spots/:spotId/reviews
router.get("/:spotId/reviews", async (req, res, next) => {
  const spotId = req.params.spotId;
  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const spotReviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });
    res.json(spotReviews);
  } catch (error) {
    next(error);
  }
});

// Create a spot
// /api/spots
router.post("/", requireAuth, async (req, res, next) => {
  // pass in ownerId from restoreUser middleware
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  // 400 Status for body errors
  // Note: we'll use express-validator to validate the request body
  // This has been handled in "../../utils/validation.js"

  try {
    const newSpot = await Spot.create({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
      ownerId,
    });
    res.status(201).json(newSpot);
  } catch (error) {
    next(error);
  }
});

// Add image to spot based on spot id
// /api/spots/:spotId/images
// Also requires proper authorization in addition to authentication
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { url, preview } = req.body;
  //get ownerId to make sure current user is owner of spot
  const ownerId = req.user.id;

  if (!url) {
    const err = new Error("Validation error");
    err.status = 400;
    err.message = "Validation error";
    err.errors = { url: "Image url is required" };
    return next(err);
  }

  try {
    // Check if spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if current user is owner of spot
    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const newSpotImage = await SpotImage.create({
      url,
      preview,
      spotId,
    });

    res.status(201).json(newSpotImage);
  } catch (error) {
    next(error);
  }
});

// Create a review for a spot based on spot id
// /api/spots/:spotId/reviews
router.post("/:spotId/reviews", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { review, stars } = req.body;
  // get the userId to add the review. Comes from restoreUser middleware
  const uid = req.user.id;

  // 400 Status for body errors
  // Note: we'll use express-validator to validate the request body
  // This has been handled in "../../utils/validation.js"

  try {
    // check if spot exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // user can not review their own spot
    if (spot.ownerId === uid) {
      return res
        .status(403)
        .json({ message: "Forbidden: Can not review your own spot" });
    }

    // check if review already exists
    const existingReview = await Review.findOne({
      where: { spotId, userId: uid },
    });
    if (existingReview) {
      return res
        .status(403)
        .json({ message: "User already has a review for this spot" });
    }

    const newReview = await Review.create({
      spotId,
      userId: uid,
      review,
      stars,
    });
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
});

// Edit a spot
// /api/spots/:spotId
// Also requires proper authorization in addition to authentication
router.put("/:spotId", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const ownerId = req.user.id;

  // 400 Status for body errors
  // Note: we'll use express-validator to validate the request body
  // This has been handled in "../../utils/validation.js"

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    await spot.save();

    res.json({
      id: spot.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a spot
// /api/spots/:spotId
// Also requires proper authorization in addition to authentication
router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const ownerId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await spot.destroy();

    res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    next(error);
  }
});

router.module.exports = router;
