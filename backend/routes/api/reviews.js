const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../../utils/auth');
const { Review, Spot, SpotImage, ReviewImage, User, sequelize } = require('../../db/models');

const reviewImagesRouter = require('./review-images');
router.use('/:reviewId/images', reviewImagesRouter);


router.get('/current', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Spot,
          attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country',
            'lat', 'lng', 'name', 'price' // Include necessary spot details
          ],
          include: [
            {
              model: SpotImage,
              attributes: ['url'],
              where: { preview: true },
              required: false // If there's no preview image, don't exclude the spot
            }
          ]
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'] // Include review images
        },
        {
          model: User, // Include user details for the review
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'] // Ensure createdAt and updatedAt are included
    });

    // Reformat the reviews to match the required API format
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: review.stars,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      User: {
        id: review.User.id,
        firstName: review.User.firstName,
        lastName: review.User.lastName
      },
      Spot: {
        id: review.Spot.id,
        ownerId: review.Spot.ownerId,
        address: review.Spot.address,
        city: review.Spot.city,
        state: review.Spot.state,
        country: review.Spot.country,
        lat: review.Spot.lat,
        lng: review.Spot.lng,
        name: review.Spot.name,
        price: review.Spot.price,
        previewImage: review.Spot.SpotImages.length ? review.Spot.SpotImages[0].url : null
      },
      ReviewImages: review.ReviewImages.map(image => ({
        id: image.id,
        url: image.url
      }))
    }));

    return res.status(200).json({ Reviews: formattedReviews || [] });
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    return res.status(500).json({
      title: 'Server Error',
      message: err.message
    });
  }
});


// Get all Reviews for a Spot based on the Spot's id
router.get('/', async (req, res) => {
  const { spotId } = req.params;

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Find all reviews for the spot
  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName'], // Include user info
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url'], // Include review images
      },
    ],
    attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'], // Required review attributes
  });

  return res.status(200).json({ Reviews: reviews });
});

module.exports = router;




// Create a new review for a spot by spotId (authentication required)
router.post('/', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Check if the user already has a review for this spot
  const existingReview = await Review.findOne({
    where: {
      userId: req.user.id,
      spotId
    }
  });

  if (existingReview) {
    return res.status(403).json({
      message: "User already has a review for this spot"
    });
  }

  // Validate input
  let errors = {};
  if (!review) errors.review = 'Review text is required';
  if (!stars || stars < 1 || stars > 5) errors.stars = 'Stars must be an integer from 1 to 5';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }

  // Create the review
  const newReview = await Review.create({
    userId: req.user.id,
    spotId,
    review,
    stars,
  });

  // Recalculate the spot's avgRating
  const allReviews = await Review.findAll({
    where: { spotId },
  });

  const avgRating = allReviews.reduce((acc, curr) => acc + curr.stars, 0) / allReviews.length;

  // Update spot's avgRating
  await spot.update({ avgRating });

  return res.status(201).json({
    id: newReview.id,
    userId: newReview.userId,
    spotId: newReview.spotId,
    review: newReview.review,
    stars: newReview.stars,
    createdAt: newReview.createdAt,
    updatedAt: newReview.updatedAt,
    avgRating, // Include the new avgRating in the response
  });
});




router.put('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;

  // Check if reviewId is provided and is valid
  if (!reviewId || isNaN(parseInt(reviewId))) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        reviewId: 'Review ID is required and must be a valid integer'
      }
    });
  }

  try {
    // Check if the review exists
    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    // Ensure the current user owns the review
    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this review' });
    }

    // Validate input
    const errors = {};

    // Validate review text
    if (!review) {
      errors.review = 'Review text is required';
    }

    // Convert stars to a number
    const starsValue = Number(stars);

    // Validate stars
    if (stars === null || stars === undefined || isNaN(starsValue)) {
      errors.stars = 'Stars must be an integer from 1 to 5';
    } else if (starsValue < 1 || starsValue > 5 || !Number.isInteger(starsValue)) {
      errors.stars = 'Stars must be an integer from 1 to 5';
    }

    // If there are validation errors, return a 400 status with the exact error format
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Bad Request',
        errors
      });
    }

    // Update the review
    await existingReview.update({
      review,
      stars: starsValue  // Ensure stars is a valid integer
    });

    // Return the updated review with createdAt and updatedAt
    return res.status(200).json({
      id: existingReview.id,
      userId: existingReview.userId,
      spotId: existingReview.spotId,
      review: existingReview.review,
      stars: existingReview.stars,
      createdAt: existingReview.createdAt,
      updatedAt: existingReview.updatedAt
    });

  } catch (err) {
    // Log the full error for debugging
    console.error('Error occurred while updating review:', err);

    // Return server error
    return res.status(500).json({
      message: 'Server Error',
      error: err.message
    });
  }
});





// Delete a review (authentication required)
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }

  // Ensure the review belongs to the current user
  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await review.destroy();
  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;
