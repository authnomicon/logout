var chai = require('chai');
var expect = require('chai').expect;
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/action');

describe('logout/handlers/action', function() {
  
  it('should create handler', function() {
    var bodyParserSpy = sinon.spy();
    var csurfSpy = sinon.spy();
    var flowstateSpy = sinon.spy();
    var factory = $require('../../com/handlers/action', {
      'body-parser': { urlencoded: bodyParserSpy },
      'csurf': csurfSpy,
      'flowstate': flowstateSpy
    });
    
    var sloFactory = new Object();
    var authenticator = new Object();
    authenticator.authenticate = sinon.spy();
    var store = new Object();
    var handler = factory(sloFactory, authenticator, store);
    
    expect(handler).to.be.an('array');
    expect(bodyParserSpy).to.be.calledOnce;
    expect(bodyParserSpy).to.be.calledBefore(csurfSpy);
    expect(bodyParserSpy).to.be.calledWith({ extended: false });
    expect(csurfSpy).to.be.calledOnce;
    expect(csurfSpy).to.be.calledBefore(flowstateSpy);
    expect(flowstateSpy).to.be.calledOnce;
    expect(flowstateSpy).to.be.calledWith({ store: store });
    expect(flowstateSpy).to.be.calledBefore(authenticator.authenticate);
    expect(authenticator.authenticate).to.be.calledOnce;
    expect(authenticator.authenticate).to.be.calledWith('session');
  });
  
  describe('handler', function() {
  
    it('should call termination handler', function(done) {
      function terminate(req, res, next) {
        res.redirect('https://server.example.com/logout');
      }
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          next();
        };
      };
      var store = new Object();
      var handler = factory(terminate, authenticator, store);

      chai.express.use(handler)
        .request(function(req, res) {
          req.logout = sinon.stub().yieldsAsync(null);
          
          req.body = {
            csrf_token: '3aev7m03-1WTaAw4lJ_GWEMkjwFBu_lwNWG8'
          };
          req.session = {
            csrfSecret: 'zbVXAFVVUSXO0_ZZLBYVP9ue'
          };
          req.connection = {};
        })
        .finish(function() {
          expect(this.req.logout).to.have.been.calledOnce;
          expect(this).to.have.status(302);
          expect(this.getHeader('Location')).to.equal('https://server.example.com/logout');
          done();
        })
        .next(function(err) {
          // TODO: This is needed to catch assertions thrown in `finish` above.  These
          // should really be caught in chai-express-handler
          done(err);
        })
        .listen();
    }); // should call termination handler
  
  }); // handler
  
});
