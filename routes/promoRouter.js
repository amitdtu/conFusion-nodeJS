const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    res.end('Will send all promos to you.');
  })
  .post((req, res, next) => {
    res.end(
      `Will add promo: ${req.body.name} with details ${req.body.description} `
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported');
  })
  .delete((req, res, next) => {
    res.end('deleting all the promos.');
  });

promoRouter
  .route('/:promoId')
  .get((req, res, next) => {
    res.end(`Will send the promo: ${req.params.promoId}`);
  })

  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported`);
  })

  .put((req, res, next) => {
    res.end(
      `Will update the promo: ${req.body.name} with details ${req.body.description}`
    );
  })

  .delete((req, res, next) => {
    res.end(`Deleting the promo: ${req.params.promoId} `);
  });

module.exports = promoRouter;
