const express = require('express');
const router = require('express').Router({ mergeParams: true }); // Allows access to :spotId
const { requireAuth, requireProperAuthorization } = require('../../utils/auth');
const { Booking, Spot, SpotImage, User, sequelize } = require('../../db/models');
const { Op } = require('sequelize'); // Import Op for Sequelize operations


router.get('/current', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id }, // Fetch bookings by the current user
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
              required: false // Ensure the spot can still be returned even if no preview image exists
            }
          ]
        }
      ],
      attributes: [
        'id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt' // Include booking details
      ]
    });

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      spotId: booking.spotId,
      Spot: {
        id: booking.Spot.id,
        ownerId: booking.Spot.ownerId,
        address: booking.Spot.address,
        city: booking.Spot.city,
        state: booking.Spot.state,
        country: booking.Spot.country,
        lat: booking.Spot.lat,
        lng: booking.Spot.lng,
        name: booking.Spot.name,
        price: booking.Spot.price,
        previewImage: booking.Spot.SpotImages.length ? booking.Spot.SpotImages[0].url : null // Get the preview image if available
      },
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.status(200).json({ Bookings: formattedBookings });
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
    return res.status(500).json({
      title: 'Server Error',
      message: err.message
    });
  }
});





router.get('/', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req; // This is the logged-in user from `requireAuth`

  try {
    // Fetch the spot to verify its existence and ownership
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found"
      });
    }

    // Fetch bookings for the specified spot
    const bookings = await Booking.findAll({
      where: { spotId },
      include: [
        {
          model: User, // Include user details for owner scenario
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      attributes: [
        'id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'
      ]
    });

    if (spot.ownerId === user.id) {
      // If the current user is the owner of the spot, return full booking info with user details
      return res.status(200).json({
        Bookings: bookings.map(booking => ({
          User: {
            id: booking.User.id,
            firstName: booking.User.firstName,
            lastName: booking.User.lastName
          },
          id: booking.id,
          spotId: booking.spotId,
          userId: booking.userId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        }))
      });
    } else {
      // If the user is not the owner, return only limited booking info
      return res.status(200).json({
        Bookings: bookings.map(booking => ({
          spotId: booking.spotId,
          startDate: booking.startDate,
          endDate: booking.endDate
        }))
      });
    }
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
    return res.status(500).json({
      title: 'Server Error',
      message: err.message
    });
  }
});





router.post('/', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  // Convert to Date objects for validation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // Validate the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Ensure the spot does not belong to the current user
  if (spot.ownerId === req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You cannot book your own spot' });
  }

  // Check if startDate is in the past
  if (start < today) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        startDate: 'Start date cannot be in the past',
      },
    });
  }

  // Check if endDate is before or equal to startDate
  if (end <= start) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        endDate: 'End date cannot be on or before start date',
      },
    });
  }

  // Check for date conflicts with existing bookings
  const conflictingBookings = await Booking.findAll({
    where: {
      spotId,
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [start, end], // Normalized startDate conflicts with existing range
          },
        },
        {
          endDate: {
            [Op.between]: [start, end], // Normalized endDate conflicts with existing range
          },
        },
        {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: start, // Normalized startDate comparison
              },
              endDate: {
                [Op.gte]: end, // Normalized endDate comparison
              },
            },
          ],
        },
        {
          startDate: { [Op.eq]: end }, // Prevent new booking's startDate being the same as an existing booking's endDate
        },
        {
          endDate: { [Op.eq]: start }, // Prevent new booking's endDate being the same as an existing booking's startDate
        }
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  // Create the booking
  const newBooking = await Booking.create({
    userId: req.user.id,
    spotId,
    startDate,
    endDate,
  });

  return res.status(201).json(newBooking);
});





router.put('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;

  // Find the booking by its ID
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({
      message: "Booking couldn't be found",
    });
  }

  // Ensure the booking belongs to the current user
  if (booking.userId !== req.user.id) {
    return res.status(403).json({
      message: 'Forbidden: You can only edit your own bookings',
    });
  }

  // Ensure the booking is not in the past
  const currentDate = new Date();
  if (new Date(booking.endDate) < currentDate) {
    return res.status(403).json({
      message: "Past bookings can't be modified",
    });
  }

  // Convert input dates to Date objects for validation
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate the start date is not in the past
  if (start < currentDate) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        startDate: 'Start date cannot be in the past',
      },
    });
  }

  // Validate the end date is not before or on the start date
  if (end <= start) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        endDate: 'End date cannot be on or before start date',
      },
    });
  }

  // Check for date conflicts with other bookings, excluding the current booking
  const conflictingBookings = await Booking.findAll({
    where: {
      spotId: booking.spotId,
      id: { [Op.ne]: booking.id }, // Exclude the current booking from the conflict check
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [start, end], // Normalized startDate conflicts with existing range
          },
        },
        {
          endDate: {
            [Op.between]: [start, end], // Normalized endDate conflicts with existing range
          },
        },
        {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: start, // Normalized startDate comparison
              },
              endDate: {
                [Op.gte]: end, // Normalized endDate comparison
              },
            },
          ],
        },
        {
          startDate: { [Op.eq]: end }, // Prevent new booking's startDate being the same as an existing booking's endDate
        },
        {
          endDate: { [Op.eq]: start }, // Prevent new booking's endDate being the same as an existing booking's startDate
        }
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  // Update the booking with the new dates
  await booking.update({ startDate, endDate });

  // Return the updated booking with createdAt and updatedAt
  return res.status(200).json({
    id: booking.id,
    spotId: booking.spotId,
    userId: booking.userId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  });
});





// Delete a booking (authentication required)
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  // Ensure the booking belongs to the current user or the spot belongs to the current user
  const spot = await Spot.findByPk(booking.spotId);
  if (booking.userId !== req.user.id && spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You can only delete your own bookings or bookings for your spots' });
  }

  // Ensure the booking has not started yet
  const currentDate = new Date();
  if (new Date(booking.startDate) <= currentDate) {
    return res.status(403).json({ message: "Bookings that have started can't be deleted" });
  }

  await booking.destroy();
  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;
