const express = require('express');
const bodyParser = require('body-parser');
const Promos = require('../models/promos');
const promoRouter = express.Router();
const authenticate = require('../authenticate');

promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .get((req, res, next) => {
    Promos.find()
      .then(
        (promos) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promos);
        },
        (err) => next(err)
      )
      .catch((err) => console.log(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.create(req.body)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported');
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promos.remove()
        .then(
          (resp) => {
            console.log('Promos deleted ', resp);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

promoRouter
  .route('/:promoId')
  .get((req, res, next) => {
    Promos.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })

  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported`);
  })

  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.findById(req.params.promoId)
      .then(
        (promo) => {
          if (promo != null) {
            if (req.body.name) promo.name = req.body.name;
            if (req.body.image) promo.image = req.body.image;
            if (req.body.label) promo.label = req.body.label;
            if (req.body.price) promo.price = req.body.price;
            if (req.body.description) promo.description = req.body.description;
            if (req.body.featured)
              promo.featured = req.body.featured === 'true' ? true : false;
            console.log(req.body);
            promo.save().then(
              (promo) => {
                res.statusCode = 200;
                res.setHeader('Contnet-Type', 'application/json');
                res.json(promo);
              },
              (err) => next(err)
            );
          } else {
            const err = new Error(`Promo ${req.params.promoId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promos.findByIdAndRemove(req.params.promoId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

module.exports = promoRouter;
