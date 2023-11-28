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


exports = module.exports = function(termHandler, authenticator, store) {
  if (termHandler) { termHandler = flatten([ termHandler ]); }
  
  
  function logout(req, res, next) {
    // TODO: Check the confirm parameter
    req.logout(function(err) {
      if (err) { return next(err); }
      next();
    });
  }
  
  function logoutOfIDP(req, res, next) {
    if (!termHandler) { return next(); }
    
    dispatch(termHandler)(null, req, res, next);
  }
  
  function resumeState(req, res, next) {
    res.resumeState(next);
  }
  
  function goHome(req, res, next) {
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
    logoutOfIDP,
    resumeState,
    goHome
  ];
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/federated.SessionTerminationHandler?',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
