"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Review belongs to a user and a spot
      Review.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
      Review.belongsTo(models.Spot, {
        foreignKey: "spotId",
        onDelete: "CASCADE",
      });
      // Review can have many images
      Review.hasMany(models.ReviewImages, {
        foreignKey: "reviewId",
        onDelete: "CASCADE",
      });
    }
  }
  Review.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      review: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stars: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
