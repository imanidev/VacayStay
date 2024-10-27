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
    const spotId1 = spots[0].id;
    const spotId2 = spots[1].id;

    options.tableName = 'SpotImages';

    await queryInterface.bulkDelete(options, null, {});

    return queryInterface.bulkInsert(options, [
      {
        spotId: spotId1,  // Dynamically fetched
        url: 'https://www.thepinnaclelist.com/wp-content/uploads/2016/12/01-Feldbalz-House-Luxury-Residence-Zurichsee-Zurich-Switzerland.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spotId2,  // Dynamically fetched
        url: 'https://www.pasionitaliana.com/wp-content/uploads/2020/05/Amalfi-e1631221740278.jpg',
        preview: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [spotId1, spotId2] }  // Dynamically fetched
    }, {});
  }
};
