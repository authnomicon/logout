/**
 * Logout service.
 */
exports = module.exports = function(promptHandler, actionHandler) {
  var express = require('express');
  
  var router = new express.Router();
  router.get('/', promptHandler);
  router.post('/', actionHandler);
  
  return router;
};

exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/logout';
exports['@require'] = [
  './handlers/prompt',
  './handlers/action'
];
