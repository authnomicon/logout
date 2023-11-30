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


/**
 * Create logout handler.
 *
 * Returns a handler that logs the user out.
 *
 * This handler logs the user out of a previously established login session.
 *
 * First, the application's local login session is torn down.  This is done
 * by calling `req#logout()`.  This function is typically provided by `passport`
 * and will invoke the underlying session manager to terminate the session.
 *
 * Then, if the application is federating with an identity provider (IDP) for
 * single sign-on (SSO) (for instance, by using `@authnomicon/federated`), the
 * federated session termination handler will be invoked.  This allows the
 * application to send a logout request to the IDP to terminate its session.
 * Thus, the complete logical session can be terminated by independently
 * terminating its constituent physical sessions at both the application and the
 * IDP.
 *
 * If sessions at related applications were established using SSO via the same
 * IDP, those sessions (which are also part of the same logical session) may
 * also be terminated as a result of the IDP sending subsequent logout requests
 * the the other applications.  Such single logout (SLO) functionality is the
 * responsibility of the IDP and not a concern of the application.
 */
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
