const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth } = require("../../utils/auth");
const { Review, ReviewImage } = require("../../db/models");

// Add an image to a review based on the review's id
// /api/reviews/:reviewId/images
router.post("/", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  const { url } = req.body;

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImage,
          attributes: imageAttributes,
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

    const newImage = await ReviewImage.create({
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
  const { reviewId, imageId } = req.params;
  const uid = req.user.id;

  try {
    const existingReview = await Review.findByPk(reviewId, {
      include: [{ model: ReviewImage, where: { id: imageId }, required: true }],
    });

    // check if review exists
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    // check if review belongs to user
    if (existingReview.userId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // check if image belongs to review
    if (existingReview.Images.length === 0) {
      const err = new Error("Review Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    const image = await ReviewImage.findByPk(imageId);
    if (!image) {
      const err = new Error("Review Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    await image.destroy();
    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;