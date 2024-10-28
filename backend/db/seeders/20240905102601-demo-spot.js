"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the user IDs dynamically from the Users table
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM ${options.schema ? `"${options.schema}".` : ""}"Users"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Ensure at least two users are available
    const ownerId1 = users[0]?.id; // First user
    const ownerId2 = users[1]?.id; // Second user

    options.tableName = "Spots";

    // Clear existing spots
    await queryInterface.bulkDelete(options, null, {});

    // Insert eight demo spots
    return queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: ownerId1,
          address: "101 Skyline Ave",
          city: "Metrohaven",
          state: "NY",
          country: "USA",
          lat: 40.7128,
          lng: -74.006,
          name: "Cityscape Retreat",
          description:
            "A stylish getaway nestled within the vibrant city skyline, offering modern comforts with a city view.",
          price: 180.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          ownerId: ownerId2,
          address: "202 Maple Ave",
          city: "Smalltown",
          state: "CO",
          country: "USA",
          lat: 36.7783,
          lng: -119.4179,
          name: "Countryside Haven",
          description: "Enjoy peace and quiet in a cozy rural setting.",
          price: 80.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId1,
          address: "303 Ocean Dr",
          city: "Beachside",
          state: "FL",
          country: "USA",
          lat: 25.7617,
          lng: -80.1918,
          name: "Seaside Bungalow",
          description: "Steps from the sand and surf.",
          price: 200.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId2,
          address: "404 Elm St",
          city: "Historic City",
          state: "VA",
          country: "England",
          lat: 39.9526,
          lng: -75.1652,
          name: "Colonial Charm",
          description: "Step back in time with this historic home.",
          price: 130.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId1,
          address: "505 River Rd",
          city: "Riverside",
          state: "MO",
          country: "USA",
          lat: 32.7157,
          lng: -117.1611,
          name: "Waterfront Escape",
          description: "Beautiful views along the riverfront.",
          price: 150.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId2,
          address: "606 Mountain Rd",
          city: "Hillside",
          state: "CA",
          country: "USA",
          lat: 39.7392,
          lng: -104.9903,
          name: "Mountain Cabin",
          description: "A secluded spot in the hills.",
          price: 90.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId1,
          address: "707 Lake Dr",
          city: "Lakeview",
          state: "LV",
          country: "USA",
          lat: 47.6062,
          lng: -122.3321,
          name: "Lakeside Lodge",
          description: "A peaceful spot with lake views.",
          price: 160.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ownerId: ownerId2,
          address: "808 Desert Rd",
          city: "Oasis",
          state: "OA",
          country: "USA",
          lat: 36.1699,
          lng: -115.1398,
          name: "Desert Retreat",
          description: "Warm days and clear starry nights.",
          price: 110.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        ownerId: { [Op.in]: [ownerId1, ownerId2] },
      },
      {}
    );
  },
};
