var chai = require('chai');
var expect = require('chai').expect;
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/prompt');


describe('handlers/prompt', function() {
  
  it('should create handler', function() {
    var csurfSpy = sinon.spy();
    var flowstateSpy = sinon.spy();
    var factory = $require('../../com/handlers/prompt', {
      'csurf': csurfSpy,
      'flowstate': flowstateSpy
    });
    
    var store = new Object();
    var handler = factory(store);
    
    expect(handler).to.be.an('array');
    expect(csurfSpy).to.be.calledOnce;
    expect(csurfSpy).to.be.calledBefore(flowstateSpy);
    expect(flowstateSpy).to.be.calledOnce;
    expect(flowstateSpy).to.be.calledWith({ store: store });
  });
  
  describe('handler', function() {
    
    it('should render', function(done) {
      var store = new Object();
      var handler = factory(store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.session = {};
          req.connection = {};
        })
        .finish(function() {
          expect(this).to.have.status(200);
          expect(this).to.render('logout');
          expect(this).to.include.locals([ 'csrfToken' ]);
          done();
        })
        .listen();
    }); // should render
    
    it('should invoke next route when CSRF token is supplied', function(done) {
      var store = new Object();
      var handler = factory(store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.query = { csrf_token: '3aev7m03-1WTaAw4lJ_GWEMkjwFBu_lwNWG8' };
          req.session = {};
          req.connection = {};
        })
        .next(function(err) {
          expect(err).to.equal('route');
          done();
        })
        .listen();
    }); // should invoke next route when CSRF token is supplied
    
  }); // handler
  
});
