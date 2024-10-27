'use strict';

let options = {};
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

    options.tableName = 'Reviews';

    await queryInterface.bulkDelete(options, null, {});

    return queryInterface.bulkInsert(options, [
      {
        spotId: spotId1,
        userId: 1,
        review: 'Great spot!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spotId2,
        userId: 2,
        review: 'Loved it!',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [spotId1, spotId2] }
    }, {});
  }
};
