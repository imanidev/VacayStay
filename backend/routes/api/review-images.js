const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth } = require("../../utils/auth");
const { Review, ReviewImages } = require("../../db/models");

// Add an image to a review based on the review's id
// /api/reviews/:reviewId/images
router.post("/", requireAuth, async (req, res, next) => {
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
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImages,
          attributes: ["id", "url"],
        },
      ],
    });

    // send 404 if review doesn't exist
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    //   check if review belongs to user
    if (existingReview.userId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // check if maxed images - max of 10
    if (existingReview.Images.length >= 10) {
      const err = new Error(
        "Maximum number of images for this resource was reached"
      );
      err.status = 403;
      return next(err);
    }

    const newImage = await ReviewImages.create({
      url,
      reviewId,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a review image
// /api/reviews/:reviewId/images/:imageId
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const imageId = req.params.imageId;
  const userId = req.user.id;

  try {
    // Find the ReviewImage with its associated Review
    const image = await ReviewImages.findByPk(imageId, {
      include: {
        model: Review,
        attributes: ["userId"],
      },
    });

    // Return 404 if the image doesn't exist
    if (!image) {
      return res
        .status(404)
        .json({ message: "Review Image couldn't be found" });
    }

    // Check if the current user is the owner of the review
    if (image.Review.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this review" });
    }

    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
