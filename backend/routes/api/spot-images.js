const express = require('express');
const { SpotImage, Spot } = require('../../db/models');
const { requireAuth, requireProperAuthorization} = require('../../utils/auth');
const router = express.Router();

// POST add an image to a spot by spotId (authentication and authorization required)
router.post('/:spotId/images', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Ensure the current user owns the spot
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Create a new image
  const newImage = await SpotImage.create({
    spotId,
    url,
    preview,
  });

  return res.status(201).json({
    id: newImage.id,
    url: newImage.url,
    preview: newImage.preview,
  });
});

// DELETE a spot image by imageId (authentication and authorization required)
router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  try {
    // Find the image by ID
    const spotImage = await SpotImage.findByPk(imageId);
    if (!spotImage) {
      return res.status(404).json({
        message: "Spot Image couldn't be found",
      });
    }

    // Find the spot to which this image belongs
    const spot = await Spot.findByPk(spotImage.spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // Ensure the current user owns the spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this image',
      });
    }

    // Proceed with deleting the image
    await spotImage.destroy();
    return res.status(200).json({ message: 'Successfully deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
