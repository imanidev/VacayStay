const express = require('express');
const { Spot, SpotImage, Review, Booking, sequelize, User } = require('../../db/models');
const { requireAuth, requireProperAuthorization } = require('../../utils/auth');
const router = express.Router();

const bookingsRouter = require('./bookings');
router.use('/:spotId/bookings', bookingsRouter);

const reviewsRouter = require('./reviews');
router.use('/:spotId/reviews', reviewsRouter);




// GET all spots owned by the current user (authentication required)
// router.get('/current', requireAuth, async (req, res) => {
//   try {
//     // Fetch spots for the current user
//     const spots = await Spot.findAll({
//       where: { ownerId: req.user.id },
//       include: [
//         {
//           model: SpotImage,
//           attributes: ['url', 'preview'],
//           where: { preview: true },
//           required: false,
//         },
//         {
//           model: Review,
//           attributes: [],
//         }
//       ],
//       attributes: [
//         'id',
//         'ownerId',
//         'address',
//         'city',
//         'state',
//         'country',
//         'lat',
//         'lng',
//         'name',
//         'description',
//         'price',
//         'createdAt', // Explicitly include createdAt
//         'updatedAt'  // Explicitly include updatedAt
//       ]
//     });

//     // Map through spots and create the response
//     const spotsList = spots.map(spot => ({
//       id: spot.id,
//       ownerId: spot.ownerId,
//       address: spot.address,
//       city: spot.city,
//       state: spot.state,
//       country: spot.country,
//       lat: spot.lat,
//       lng: spot.lng,
//       name: spot.name,
//       description: spot.description,
//       price: spot.price,
//       createdAt: spot.createdAt,  // Return createdAt in response
//       updatedAt: spot.updatedAt,  // Return updatedAt in response
//       avgRating: spot.dataValues.avgRating || null,
//       previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null,
//     }));

//     return res.status(200).json({ Spots: spotsList });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       message: 'An error occurred while fetching user spots.',
//     });
//   }
// });

router.get('/current', requireAuth, async (req, res) => {
  try {
    // Fetch spots for the current user
    const spots = await Spot.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: SpotImage,
          attributes: ['url', 'preview'],
          where: { preview: true },
          required: false,
        },
        {
          model: Review,
          attributes: [] // We are not interested in the individual reviews, just the avgRating
        }
      ],
      attributes: [
        'id',
        'ownerId',
        'address',
        'city',
        'state',
        'country',
        'lat',
        'lng',
        'name',
        'description',
        'price',
        'createdAt', // Explicitly include createdAt
        'updatedAt',  // Explicitly include updatedAt
        [
          // Sequelize function to calculate the average rating
          sequelize.fn('AVG', sequelize.col('Reviews.stars')),
          'avgRating'
        ]
      ],
      group: ['Spot.id', 'SpotImages.id'], // Group by Spot and SpotImages to avoid aggregation errors
    });

    // Map through spots and create the response
    const spotsList = spots.map(spot => ({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,  // Return createdAt in response
      updatedAt: spot.updatedAt,  // Return updatedAt in response
      avgRating: spot.dataValues.avgRating ? Number(spot.dataValues.avgRating).toFixed(2) : "New", // Format the avgRating or return "New"
      previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null,
    }));

    return res.status(200).json({ Spots: spotsList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'An error occurred while fetching user spots.',
    });
  }
});



router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;

  if (!spotId || isNaN(spotId)) {
    return res.status(400).json({
      message: "Invalid spotId. It must be a valid integer."
    });
  }

  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: SpotImage,
        attributes: ['id', 'url', 'preview'],
        required: false,
      },
      {
        model: Review,
        attributes: ['stars'],
      },
      {
        model: User,
        as: 'Owner',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    attributes: [
      'id',
      'ownerId',
      'address',
      'city',
      'state',
      'country',
      'lat',
      'lng',
      'name',
      'description',
      'price',
      'createdAt',
      'updatedAt'
    ]
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  // Calculate the average star rating and number of reviews
  const avgRating = await Review.findOne({
    where: { spotId: spot.id },
    attributes: [[sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating']],
    raw: true,
  });

  const numReviews = await Review.count({ where: { spotId: spot.id } });

  // Ensure that avgStarRating is a float and rounded to one decimal, or return 'New'
  const avgStarRating = avgRating.avgStarRating ? parseFloat(avgRating.avgStarRating).toFixed(1) : 'New';

  // Return the spot details, including the calculated avgStarRating and numReviews
  return res.status(200).json({
    id: spot.id,
    ownerId: spot.ownerId,
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
    createdAt: spot.createdAt,  // Return createdAt in response
    updatedAt: spot.updatedAt,  // Return updatedAt in response
    numReviews,
    avgStarRating,  // Return the calculated average star rating or 'New'
    SpotImages: spot.SpotImages,
    Owner: {
      id: spot.Owner.id,
      firstName: spot.Owner.firstName,
      lastName: spot.Owner.lastName
    }
  });
});




router.get('/', async (req, res) => {
  try {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

    // Set defaults and validate
  // Set defaults for size and validate page and size
 // Set defaults for page and size
page = page ? parseInt(page) : 1;
size = size ? parseInt(size) : 20;

// Validation for page and size parameters
if (isNaN(page) || page < 1) {
  return res.status(400).json({
    message: 'Bad Request',
    errors: { page: 'Page must be greater than or equal to 1' }
  });
}

if (isNaN(size) || size < 1 || size > 20) {
  return res.status(400).json({
    message: 'Bad Request',
    errors: { size: 'Size must be between 1 and 20' }
  });
}

    const where = {};

    // Add latitude filters
    if (minLat && (isNaN(minLat) || minLat < -90 || minLat > 90)) {
      return res.status(400).json({ message: 'Bad Request', errors: { minLat: 'Minimum latitude is invalid' } });
    } else if (minLat) {
      where.lat = { [sequelize.Op.gte]: parseFloat(minLat) };
    }

    if (maxLat && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) {
      return res.status(400).json({ message: 'Bad Request', errors: { maxLat: 'Maximum latitude is invalid' } });
    } else if (maxLat) {
      where.lat = { ...where.lat, [sequelize.Op.lte]: parseFloat(maxLat) };
    }

    // Add longitude filters
    if (minLng && (isNaN(minLng) || minLng < -180 || minLng > 180)) {
      return res.status(400).json({ message: 'Bad Request', errors: { minLng: 'Minimum longitude is invalid' } });
    } else if (minLng) {
      where.lng = { [sequelize.Op.gte]: parseFloat(minLng) };
    }

    if (maxLng && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) {
      return res.status(400).json({ message: 'Bad Request', errors: { maxLng: 'Maximum longitude is invalid' } });
    } else if (maxLng) {
      where.lng = { ...where.lng, [sequelize.Op.lte]: parseFloat(maxLng) };
    }

    // Add price filters
    if (minPrice && minPrice < 0) {
      return res.status(400).json({ message: 'Bad Request', errors: { minPrice: 'Minimum price must be greater than or equal to 0' } });
    } else if (minPrice) {
      where.price = { [sequelize.Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice && maxPrice < 0) {
      return res.status(400).json({ message: 'Bad Request', errors: { maxPrice: 'Maximum price must be greater than or equal to 0' } });
    } else if (maxPrice) {
      where.price = { ...where.price, [sequelize.Op.lte]: parseFloat(maxPrice) };
    }

    // Fetch spots with the applied filters and pagination
    const spots = await Spot.findAll({
      where,
      attributes: [
        'id',
        'ownerId',
        'address',
        'city',
        'state',
        'country',
        'lat',
        'lng',
        'name',
        'description',
        'price',
        'createdAt',  // Explicitly include createdAt
        'updatedAt'   // Explicitly include updatedAt
      ],
      include: [
        {
          model: SpotImage,
          attributes: ['url', 'preview'],
          where: { preview: true },
          required: false,
        }
      ],
      limit: size,
      offset: (page - 1) * size,
    });

    // For each spot, calculate the average rating
    const spotsList = await Promise.all(spots.map(async spot => {
      // Calculate avgRating for each spot
      const avgRating = await Review.findOne({
        where: { spotId: spot.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']],
        raw: true
      });

      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,   // Include createdAt
        updatedAt: spot.updatedAt,   // Include updatedAt
        avgRating: avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : null, // Round avgRating to 1 decimal place
        previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null,
      };
    }));

    return res.status(200).json({ Spots: spotsList, page, size });
  } catch (err) {
    console.error('Error fetching spots:', err.message);
    return res.status(500).json({
      message: 'An error occurred while fetching spots.',
      error: err.message
    });
  }
});








// POST add an image to a spot (authentication and authorization required)
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

  // Check if the current user owns the spot
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Create the new image
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




// POST create a spot (authentication required)

router.post('/', requireAuth, async (req, res) => {

  router.post('/', requireAuth, async (req, res) => {
    console.log('Received Request Headers:', req.headers);
    console.log('Received Request Body:', req.body);

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Continue with your validation and response code...
  });

  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  // Log the incoming data for debugging
  console.log('Request Body:', req.body);

  // Convert lat and lng to numbers to ensure correct type
  const latitude = Number(lat);
  const longitude = Number(lng);

  // Validation errors object
  let errors = {};

  // Required fields validation
  if (!address) errors.address = "Street address is required";
  if (!city) errors.city = "City is required";
  if (!state) errors.state = "State is required";
  if (!country) errors.country = "Country is required";

  // Latitude validation (must be between -90 and 90)
  if (latitude === undefined || isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.lat = "Latitude must be a valid number within -90 and 90";
  }

  // Longitude validation (must be between -180 and 180)
  if (longitude === undefined || isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.lng = "Longitude must be a valid number within -180 and 180";
  }

  // Name validation (must be less than 50 characters)
  if (!name || name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  }

  // Description validation (must not be empty)
  if (!description) {
    errors.description = "Description is required";
  }

  // Price validation (must be a positive number)
  if (price === undefined || price <= 0) {
    errors.price = "Price per day must be a positive number";
  }

  // If there are validation errors, return a 400 response with the errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation Error",
      errors
    });
  }

  // Create the new spot after successful validation
  const newSpot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat: latitude,  // using the parsed number values
    lng: longitude, // using the parsed number values
    name,
    description,
    price
  });

  // Return the newly created spot with a 201 status
  return res.status(201).json({
    id: newSpot.id,
    ownerId: newSpot.ownerId,
    address: newSpot.address,
    city: newSpot.city,
    state: newSpot.state,
    country: newSpot.country,
    lat: newSpot.lat,
    lng: newSpot.lng,
    name: newSpot.name,
    description: newSpot.description,
    price: newSpot.price,
    createdAt: newSpot.createdAt,
    updatedAt: newSpot.updatedAt
  });
});




// PUT edit a spot (authentication and authorization required)
router.put('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;

  try {
    // Find the spot by its id, including SpotImages to retrieve the preview image
    const spot = await Spot.findByPk(spotId, {
      include: {
        model: SpotImage,
        as: 'SpotImages', // Alias must match your model definition
        where: { preview: true },  // Only get the preview image
        required: false  // Allow it to return even if there are no images
      }
    });

    // If the spot is not found, return a 404 error
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user owns the spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Validation errors object
    let errors = {};

    // Required fields validation
    if (!address) errors.address = "Street address is required";
    if (!city) errors.city = "City is required";
    if (!state) errors.state = "State is required";
    if (!country) errors.country = "Country is required";

    // Latitude validation (must be between -90 and 90)
    if (lat === undefined || lat < -90 || lat > 90) {
      errors.lat = "Latitude must be within -90 and 90";
    }

    // Longitude validation (must be between -180 and 180)
    if (lng === undefined || lng < -180 || lng > 180) {
      errors.lng = "Longitude must be within -180 and 180";
    }

    // Name validation (must be less than 50 characters)
    if (!name || name.length > 50) {
      errors.name = "Name must be less than 50 characters";
    }

    // Description validation (must not be empty)
    if (!description) {
      errors.description = "Description is required";
    }

    // Price validation (must be a positive number)
    if (price === undefined || price <= 0) {
      errors.price = "Price per day must be a positive number";
    }

    // If there are validation errors, return a 400 response with the errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation Error",
        errors
      });
    }

    // Update the spot after successful validation
    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    // Get the preview image URL from the SpotImages association
    const previewImage = spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null;

    // Return the updated spot including the previewImage
    return res.status(200).json({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      previewImage  // Add the previewImage to the response
    });
  } catch (error) {
    console.error("Error updating spot:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// DELETE a spot (authentication and authorization required)
router.delete('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;


  const spot = await Spot.findByPk(spotId, {
    include: {
      model: SpotImage,
      as: 'SpotImages', // Alias must match your model definition
      where: { preview: true },  // Only get the preview image
      required: false  // Allow it to return even if there are no images
    }
  });

  try {
    // Find the spot by ID
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Ensure the current user owns the spot
    if (spot.ownerId !== req.user.id) {
      // If the spot doesn't belong to the user, return 403 Forbidden
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete related SpotImages
    await SpotImage.destroy({ where: { spotId } });

    // Delete related Reviews
    await Review.destroy({ where: { spotId } });

    // Delete related Bookings
    await Booking.destroy({ where: { spotId } });

    // Now, delete the spot itself
    await spot.destroy();

    // Return success message
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    return res.status(500).json({
      message: 'Server Error',
      error: err.message
    });
  }
});


module.exports = router;
