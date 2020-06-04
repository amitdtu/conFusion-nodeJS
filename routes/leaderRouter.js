const express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../models/leaders');
const leaderRouter = express.Router();
const authenticate = require('../authenticate');

leaderRouter.use(bodyParser.json());

leaderRouter
  .route('/')
  .get((req, res, next) => {
    Leaders.find()
      .then(
        (Leaders) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(Leaders);
        },
        (err) => next(err)
      )
      .catch((err) => console.log(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.create(req.body)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(leader);
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
      Leaders.remove()
        .then(
          (resp) => {
            console.log('Leaders deleted ', resp);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  );

leaderRouter
  .route('/:leaderId')
  .get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(leader);
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
    Leaders.findById(req.params.leaderId)
      .then(
        (promo) => {
          if (promo != null) {
            if (req.body.name) promo.name = req.body.name;
            if (req.body.image) promo.image = req.body.image;
            if (req.body.designation) promo.designation = req.body.designation;
            if (req.body.abbr) promo.abbr = req.body.abbr;
            if (req.body.description) promo.description = req.body.description;
            if (req.body.featured)
              promo.featured = req.body.featured === 'true' ? true : false;
            console.log(req.body);
            promo.save().then(
              (leader) => {
                res.statusCode = 200;
                res.setHeader('Contnet-Type', 'application/json');
                res.json(leader);
              },
              (err) => next(err)
            );
          } else {
            const err = new Error(`Promo ${req.params.leaderId} not found`);
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
      Leaders.findByIdAndRemove(req.params.leaderId)
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

module.exports = leaderRouter;
