"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpotImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // SpotImage belongs to a spot
      SpotImages.belongsTo(models.Spot, {
        foreignKey: "spotId",
        onDelete: "CASCADE",
      });
    }
  }
  SpotImages.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Spots",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "SpotImages",
    }
  );
  return SpotImages;
};
