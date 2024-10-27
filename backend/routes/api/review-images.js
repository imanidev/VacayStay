const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth, requireProperAuthorization } = require('../../utils/auth');
const { Review, ReviewImage } = require('../../db/models');

// Delete an existing image for a Review by imageId (authentication and proper authorization required)
router.post('/', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;

  // Check if the review exists
  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found",
    });
  }

  // Ensure the current user owns the review
  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You do not own this review' });
  }

  // Check if the review already has 10 images
  const imageCount = await ReviewImage.count({ where: { reviewId } });
  if (imageCount >= 10) {
    return res.status(403).json({
      message: "Maximum number of images for this resource was reached",
    });
  }

  // Create a new image for the review
  const newImage = await ReviewImage.create({
    reviewId,
    url,
  });

  // Return the new image
  return res.status(201).json({
    id: newImage.id,
    url: newImage.url,
  });
});

// DELETE a review image by ID (either reviewImageId or imageId)
router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  // Find the review image by ID
  const reviewImage = await ReviewImage.findByPk(imageId);
  if (!reviewImage) {
    return res.status(404).json({
      message: "Review Image couldn't be found",
    });
  }

  // Ensure the review image belongs to the current user by checking the review's userId
  const review = await Review.findByPk(reviewImage.reviewId);

  if (review.userId !== req.user.id) {
    return res.status(403).json({
      message: 'Forbidden: You do not own this review',
    });
  }

  // Delete the review image
  await reviewImage.destroy();

  return res.status(200).json({
    message: 'Successfully deleted',
  });
});

module.exports = router;
