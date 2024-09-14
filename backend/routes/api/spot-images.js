const express = require("express");
const { SpotImages, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const router = express.Router();

// delete a spot image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const { spotId, imageId } = req.params;
  const uid = req.user.id;

  try {
    // check if the spot exists
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImages,
          where: { id: imageId },
          required: true,
        },
      ],
    });
    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      next(err);
    }

    // check if the user is the owner of the spot
    if (spot.ownerId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }

    // delete the image
    const image = await SpotImages.findByPk(imageId);
    if (!image) {
      const err = new Error("Spot Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    await image.destroy();
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
