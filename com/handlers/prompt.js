// Module dependencies.
var path = require('path')
  , ejs = require('ejs');

/**
 * Create logout prompt handler.
 *
 * Returns a handler that prompts the user to logout.
 *
 * In most situations, the logout prompt is not used, as logout requests will be
 * submitted directly from the application to the `POST /logout` endpoint.
 * However, in some circumstances, such as single logout (SLO), logout will be
 * initiated by another application.  In this case, if the logout request cannot
 * be verified, the user may be prompted to confirm their intent to logout.
 * This confirmation prevents denial of service attacks.
 */
exports = module.exports = function(store) {
  
  function prompt(req, res, next) {
    // If a CSRF token is supplied, invoke the next route (which is expected to
    // be the action handler).  This allows the application to issue
    // `GET /logout` requests via redirection which terminate the login session.
    // This is particularly useful for implementing single logout (SLO), and is
    // utilized by related packages, such as `@authnomicon/openidconnect`.
    if (req.query.csrf_token) { return next('route'); }
    
    res.locals.csrfToken = req.csrfToken();
    res.render('logout', function(err, str) {
      if (err && err.view) {
        var view = path.resolve(__dirname, '../views/prompt.ejs');
        ejs.renderFile(view, res.locals, function(err, str) {
          if (err) { return next(err); }
          res.send(str);
        });
        return;
      } else if (err) {
        return next(err);
      }
      res.send(str);
    });
  }
  
  
  return [
    // TODO: authenticate this call
    require('csurf')(),
    require('flowstate')({ store: store }),
    prompt
    // Should GET requests that error with a state destroy the state?  I think not
    // There needs to be an option for it (external?) that does, for eg OAuth
    //errorLogging()
  ];
};

// Module annotations.
exports['@require'] = [
  'module:flowstate.Store'
];
