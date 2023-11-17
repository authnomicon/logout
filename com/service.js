// Module dependencies.
var express = require('express');

/**
 * Create logout service.
 */
exports = module.exports = function(promptHandler, actionHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  // For CSRF handling
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
