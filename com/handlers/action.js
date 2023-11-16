var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

exports = module.exports = function(sloFactory, authenticator, store) {
  
  function logout(req, res, next) {
    // TODO: Check the confirm parameter
    req.logout(function(err) {
      if (err) { return next(err); }
      next();
    });
  }
  
  function logoutOfIDP(req, res, next) {
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
  'module:@authnomicon/logout.SLOServiceFactory?',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
