exports = module.exports = function() {
  
  return function(req, res, next) {
    return res.redirect('/logout');
  };
};

exports['@implements'] = 'http://i.authnomicon.org/prompts/http/Prompt';
exports['@name'] = 'logout';
