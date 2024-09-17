const { requireAuth } = require("../../utils/auth");
const { User, Review, Spot, ReviewImages } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const router = require("express").Router();

// Check validation for reviews
const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

// Get the reviews of the current user
// /api/reviews/current ~ not /api/reviews/:userId
router.get("/current", requireAuth, async (req, res, next) => {
  const uid = req.user.id;
  try {
    const currentUserReviews = await Review.findAll({
      where: { userId: uid },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
            "previewImage",
          ],
        },
        {
          model: ReviewImages,
          attributes: ["id", "url"],
        },
      ],
    });
    res.json(currentUserReviews);
  } catch (error) {
    next(error);
  }
});

// Add an image to a review based on the review's id
// /api/reviews/:reviewId/images
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Validation error",
      errors: {
        url: "Url is required",
      },
    });
  }

  try {
    // Check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImages,
          attributes: ["id", "url"],
        },
      ],
    });

    // Review doesn't exist
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    // Review doesn't belong to user
    if (existingReview.userId !== uid) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // Check if maxed images - max of 10
    const reviewImages = await ReviewImages.findAll({
      where: { reviewId },
    });

    if (reviewImages.length >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    // Create the new image
    const newImage = await ReviewImages.create({
      url,
      reviewId,
    });

    res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    next(error);
  }
});

// Edit a review
// /api/reviews/:reviewId
// Also requires proper authorization in addition to authentication
router.put(
  "/:reviewId",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const uid = req.user.id;

    const { review, stars } = req.body;

    try {
      // Check if review exists
      const existingReview = await Review.findByPk(reviewId);

      if (!existingReview) {
        return res.status(404).json({ message: "Review couldn't be found" });
      }

      // Check if review belongs to user
      if (existingReview.userId !== uid) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await existingReview.update({ review, stars });
      await existingReview.save();

      res.status(200).json(existingReview);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a review
// /api/reviews/:reviewId
// Also requires proper authorization in addition to authentication
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;

  try {
    // Check if review exists
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Check if review belongs to user
    if (existingReview.userId !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await existingReview.destroy();
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
