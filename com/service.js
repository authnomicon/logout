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
  // Allow the action to be invoked via either `GET` or `POST`.  Both methods
  // are CSRF-protected, ensuring that only the application itself is able to
  // invoke the action.
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
