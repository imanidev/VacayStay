'use strict';

const options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the spot IDs dynamically from the Spots table
    const spots = await queryInterface.sequelize.query(
      `SELECT id FROM ${options.schema ? `"${options.schema}".` : ''}"Spots"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Find the correct spotId values
    const spotId1 = spots[0].id;  // First spot
    const spotId2 = spots[1].id;  // Second spot

    // Insert bookings with the dynamically fetched spotId values
    options.tableName = 'Bookings';
    await queryInterface.bulkDelete(options, null, {});

    return queryInterface.bulkInsert(options, [
      {
        spotId: spotId1,
        userId: 1,
        startDate: new Date('2024-09-10'),
        endDate: new Date('2024-09-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spotId2,
        userId: 2,
        startDate: new Date('2024-09-20'),
        endDate: new Date('2024-09-25'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [spotId1, spotId2] }
    }, {});
  }
};
