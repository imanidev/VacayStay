// ./db/models/review.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Define associations here
  // Review model
Review.belongsTo(models.User, { foreignKey: 'userId'});
Review.belongsTo(models.Spot, { foreignKey: 'spotId'});
Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId', onDelete: 'CASCADE' });
    }
  }


  Review.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Spots' }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users' }
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      }
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );

  return Review;
};
