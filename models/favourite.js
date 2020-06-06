const express = require('express');
const mongoose = require('mongoose');

const favouriteRouter = express.Router();

const favoriteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;
