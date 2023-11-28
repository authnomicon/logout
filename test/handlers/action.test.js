var chai = require('chai');
var expect = require('chai').expect;
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/action');

describe('handlers/action', function() {
  
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
    
    var noopAuthenticator = new Object();
    noopAuthenticator.authenticate = function(name, options) {
      return function(req, res, next) {
        next();
      };
    };
    var noopStateStore = new Object();
  
  
    it('should call termination handler', function(done) {
      function terminate(req, res, next) {
        res.redirect('https://server.example.com/logout');
      }
      
      var handler = factory(terminate, noopAuthenticator, noopStateStore);

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
          // FIXME: This is needed to catch assertions thrown in `finish` above.  These
          // should really be caught in chai-express-handler
          done(err);
        })
        .listen();
    }); // should call termination handler
    
    it('should call array of termination handlers', function(done) {
      function terminate1(req, res, next) {
        next()
      }
      function terminate2(req, res, next) {
        res.redirect('https://server.example.com/logout');
      }
      
      var handler = factory([ terminate1, terminate2 ], noopAuthenticator, noopStateStore);

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
        .listen();
    }); // should call array of termination handlers
    
    it('should resume state if available', function(done) {
      var handler = factory(undefined, noopAuthenticator, noopStateStore);

      chai.express.use(handler)
        .request(function(req, res) {
          req.logout = sinon.stub().yieldsAsync(null);
          req.body = {
            return_to: '/logged-out',
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
          expect(this.getHeader('Location')).to.equal('/logged-out');
          done();
        })
        .listen();
    }); // should resume state if available
    
    it('should redirect as final handler', function(done) {
      var handler = factory(undefined, noopAuthenticator, noopStateStore);

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
          expect(this.getHeader('Location')).to.equal('/');
          done();
        })
        .listen();
    }); // should redirect as final handler
  
  }); // handler
  
});
