exports = module.exports = function(authenticator, store) {
  
  function logout(req, res, next) {
    // TODO: Check the confirm parameter
    req.logout(function(err) {
      if (err) { return next(err); }
      return res.resumeState(next);
    });
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
    goHome
  ];
};

exports['@require'] = [
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
