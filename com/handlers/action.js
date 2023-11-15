exports = module.exports = function(sloFactory, authenticator, store) {
  
  function logout(req, res, next) {
    console.log('!! LOGOUT !!');
    console.log(req.user);
    console.log(req.authInfo);
    
    
    // TODO: Check the confirm parameter
    req.logout(function(err) {
      if (err) { return next(err); }
      next();
    });
  }
  
  function logoutOfIDP(req, res, next) {
    console.log('logoutOfIDP?');
    console.log(sloFactory);
    
    if (!sloFactory) { return next(); }
    
    console.log('CONSTRUCT SERVICE!');
    
    //next();
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

exports['@require'] = [
  'module:@authnomicon/logout.SLOServiceFactory?',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
