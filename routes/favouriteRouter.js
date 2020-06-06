const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favourite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favouriteRouter = express.Router();

favouriteRouter
  .route('/')
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        (fav) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(fav);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
    // , (err, fav) => {
    //   if (err) next(err);
    //   res.statusCode = 200;
    //   res.setHeader('Content-Type', 'application/json');
    //   res.json(fav);
    // });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, fav) => {
      if (err) return next(err);
      if (fav) {
        req.body.dishes.forEach((dishId) => {
          if (!fav.dishes.includes(dishId)) {
            fav.dishes.push(dishId);
          }
        });
        fav
          .save()
          .then(
            (fav) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(fav);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      } else {
        Favorites.create({
          user: req.user._id,
          dishes: [...req.body.dishes],
        }).then((fav) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(fav);
        });
      }
    });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({ user: req.user._id }, (err, fav) => {
      if (err) return next(err);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(fav);
    });
  });

favouriteRouter
  .route('/:dishId')
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, fav) => {
      if (err) return next(err);
      if (fav) {
        if (!fav.dishes.includes(req.params.dishId)) {
          fav.dishes.push(req.params.dishId);
          fav
            .save()
            .then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(fav);
        }
      } else {
        Favorites.create({
          user: req.user._id,
          dishes: [req.params.dishId],
        }).then((fav) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(fav);
        });
      }
    });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, fav) => {
      if (err) return next(err);
      const index = fav.dishes.indexOf(req.params.dishId);
      if (index > -1) {
        fav.dishes.splice(index, 1);
      }
      fav
        .save()
        .then(
          (fav) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    });
  });

module.exports = favouriteRouter;
