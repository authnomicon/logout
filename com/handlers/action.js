var flatten = require('array-flatten')
  , slice = Array.prototype.slice;

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

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
    console.log('FEDERATED LOGOUT?');
    console.log(termHandler);
    
    if (!termHandler) { return next(); }
    
    console.log('HAS TERM HANDLER');
    
    dispatch(termHandler)(null, req, res, next);
    return;
    
    
    if (!sloFactory) { return next(); }
    
    // TODO: iterate over methods.  skip non-federated methods
    var method = req.authInfo.methods[0];
    var provider = method.provider
      , protocol = method.protocol;
    
    sloFactory.create(provider, protocol)
      .then(function(service) {
        var ctx = {}; // TODO: set this to req.authInfo
        
        process.nextTick(function() {
          service.logout(ctx, res, next);
        });
      }, function(err) {
        defer(next, err);
      });
  }
  
  function resumeState(req, res, next) {
    res.resumeState(next);
  }
  
  function goHome(req, res, next) {
    res.redirect('/');
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
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
