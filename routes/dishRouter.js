const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find()
      .populate('comments.author')
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader('Contnet-Type', 'application/json');
          res.json({ dishes });
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.create(req.body)
        .then(
          (dish) => {
            console.log('Dish created ', dish);
            res.statusCode = 200;
            res.setHeader('Contnet-Type', 'application/json');
            res.json(dish);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end('PUT operation is not supported');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.remove({})
        .then(
          (response) => {
            console.log('dishes removed ', response);
            res.statusCode = 200;
            res.setHeader('Contnet-Type', 'application/json');
            res.json(response);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

dishRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          console.log(dish);
          res.statusCode = 200;
          res.setHeader('Contnet-Type', 'application/json');
          res.json(dish);
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(`POST operation is not supported`);
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        { $set: req.body },
        { new: true }
      )
        .then(
          (dish) => {
            res.statusCode = 200;
            res.setHeader('Contnet-Type', 'application/json');
            res.json(dish);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Contnet-Type', 'application/json');
            res.json(resp);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

dishRouter
  .route('/:dishId/comments')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Contnet-Type', 'application/json');
            res.json(dish.comments);
          } else {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyUser,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              req.body.author = req.user._id;
              dish.comments.push(req.body);
              dish.save().then(
                (dish) => {
                  Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json(dish);
                    });
                },
                (err) => next(err)
              );
            } else {
              const err = new Error(`Dish ${req.params.dishId} not found`);
              err.status = 404;
              return next(err);
            }
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation is not supported on /dishes/${req.params.dishId}/comments`
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              for (let i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
              }
              dish.save().then(
                (dish) => {
                  res.statusCode = 200;
                  res.setHeader('Contnet-Type', 'application/json');
                  res.json(dish);
                },
                (err) => console.log(err)
              );
            } else {
              const err = new Error(`Dish ${req.params.dishId} not found`);
              err.status = 404;
              return next(err);
            }
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

dishRouter
  .route('/:dishId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          // console.log(
          //   'is same user ',
          //   req.user._id.toString() ===
          //     dish.comments.id(req.params.commentId).author._id.toString()
          // );
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (
              req.user._id.toString() !==
              dish.comments.id(req.params.commentId).author._id.toString()
            ) {
              const err = new Error(
                `You are not authorized to perform this operation!`
              );
              err.status = 403;
              next(err);
              return;
            }
            if (req.body.rating)
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            if (req.body.comment)
              dish.comments.id(req.params.commentId).comment = req.body.comment;

            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (
              req.user._id.toString() !==
              dish.comments.id(req.params.commentId).author._id.toString()
            ) {
              const err = new Error(
                `You are not authorized to perform this operation!`
              );
              err.status = 403;
              next(err);
              return;
            }
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  });

module.exports = dishRouter;
