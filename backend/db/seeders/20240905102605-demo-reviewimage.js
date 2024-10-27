'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the review IDs dynamically from the Reviews table
    const reviews = await queryInterface.sequelize.query(
      `SELECT id FROM ${options.schema ? `"${options.schema}".` : ''}"Reviews"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Find the correct reviewId values
    const reviewId1 = reviews[0].id;
    const reviewId2 = reviews[1].id;

    options.tableName = 'ReviewImages';

    await queryInterface.bulkDelete(options, null, {});

    return queryInterface.bulkInsert(options, [
      {
        reviewId: reviewId1,  // Dynamically fetched
        url: 'http://example.com/demo-review-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: reviewId2,  // Dynamically fetched
        url: 'http://example.com/demo-review-2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [reviewId1, reviewId2] }  // Dynamically fetched
    }, {});
  }
};
