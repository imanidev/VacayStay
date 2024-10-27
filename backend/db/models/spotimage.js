// ./db/models/spotimage.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    static associate(models) {
      // Define associations here

 // SpotImage model
SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId'});

    }
  }

  SpotImage.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Spots' }
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'SpotImage',
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      },
    }
  );

  return SpotImage;
};
