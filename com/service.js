// Module dependencies.
var express = require('express');

/**
 * Create logout service.
 *
 * Returns an HTTP service that handles logout requests.
 *
 * @returns {express.RequestHandler}
 */
exports = module.exports = function(promptHandler, actionHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  router.get('/', actionHandler);
  router.post('/', actionHandler);
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/logout';
exports['@require'] = [
  './handlers/prompt',
  './handlers/action'
];
