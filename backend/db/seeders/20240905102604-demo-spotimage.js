"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the spot IDs dynamically from the Spots table
    const spots = await queryInterface.sequelize.query(
      `SELECT id FROM ${options.schema ? `"${options.schema}".` : ""}"Spots"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Ensure at least eight spots are available
    const [
      spotId1,
      spotId2,
      spotId3,
      spotId4,
      spotId5,
      spotId6,
      spotId7,
      spotId8,
    ] = spots.map((spot) => spot.id);

    options.tableName = "SpotImages";

    await queryInterface.bulkDelete(options, null, {});

    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: spotId1,
          url: "https://images.stockcake.com/public/6/7/d/67d9519b-38a3-4d57-96bb-15f16aed50f7_large/urban-residential-street-stockcake.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId2,
          url: "https://media.istockphoto.com/id/1516938158/photo/3d-render-of-forest-house-with-large-windows-at-night.jpg?s=612x612&w=0&k=20&c=C-peb5w4MRU4rcl0M45-zX6NMUXPwtmIDPWRbuJ4Quw=",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId3,
          url: " https://st4.depositphotos.com/1009701/39217/i/450/depositphotos_392174784-stock-photo-beautiful-florida-house-beach-rent.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId4,
          url: "https://cdn11.bigcommerce.com/s-g95xg0y1db/images/stencil/1280x1280/k/colonial%20house%20plan%20-%209286__49336.original.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId5,
          url: "https://as1.ftcdn.net/v2/jpg/09/18/71/36/1000_F_918713613_1rOf7ZmSiECSI2jL2reydPx3ODmHfG4V.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId6,
          url: "https://as1.ftcdn.net/v2/jpg/09/18/71/36/1000_F_918713613_1rOf7ZmSiECSI2jL2reydPx3ODmHfG4V.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId7,
          url: "https://www.shutterstock.com/image-photo/blue-ridge-mountain-cabin-view-600nw-1064112713.jpg",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: spotId8,
          url: "https://images.rezfusion.com/?optimize=true&rotate=true&quality=70&width=2048&source=https%3A//img.trackhs.com/x/https%3A//track-pm.s3.amazonaws.com/tluxp/image/db0db3e6-6c72-4096-a77b-da8f938b68b3&settings=default",
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        spotId: {
          [Op.in]: [
            spotId1,
            spotId2,
            spotId3,
            spotId4,
            spotId5,
            spotId6,
            spotId7,
            spotId8,
          ],
        },
      },
      {}
    );
  },
};
