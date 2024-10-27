// ./db/models/reviewimage.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      // Define associations here
      ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId'});
    }
  }

  ReviewImage.init(
    {
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Reviews' }
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
      }
    },
    {
      sequelize,
      modelName: 'ReviewImage',
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      },
    }
  );

  return ReviewImage;
};
