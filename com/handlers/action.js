// Module dependencies.
var flatten = require('array-flatten')
  , slice = Array.prototype.slice;

function dispatch(stack) {
  return function(err, req, res, next) {
    var i = 0;

    function callbacks(err) {
      var fn = stack[i++];
      try {
        if ('route' == err) {
          next('route');
        } else if (err && fn) {
          if (fn.length < 4) return callbacks(err);
          fn(err, req, res, callbacks);
        } else if (fn) {
          if (fn.length < 4) return fn(req, res, callbacks);
          callbacks();
        } else {
          next(err);
        }
      } catch (err) {
        callbacks(err);
      }
    }
    callbacks(err);
  }
};


exports = module.exports = function(federatedTermHandler, authenticator, store) {
  if (federatedTermHandler) { federatedTermHandler = flatten([ federatedTermHandler ]); }
  
  function logout(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      next();
    });
  }
  
  function federatedLogout(req, res, next) {
    if (!federatedTermHandler) { return next(); }
    dispatch(federatedTermHandler)(null, req, res, next);
  }
  
  function resume(req, res, next) {
    res.resumeState(next);
  }
  
  function redirect(req, res, next) {
    res.redirect('/');
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({
      ignoreMethods: [ 'HEAD', 'OPTIONS' ],
      value: function(req){ return (req.body && req.body.csrf_token) || (req.query && req.query.csrf_token); }
    }),
    require('flowstate')({ store: store }),
    authenticator.authenticate('session'),
    logout,
    federatedLogout,
    resume,
    redirect
  ];
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/federated.SessionTerminationHandler?',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
