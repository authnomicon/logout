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
    
    function authenticate(idp, options) {
      return function(req, res, next) {
        next();
      };
    }
  
    it('should logout of IDP', function(done) {
      
      var service = new Object();
      service.logout = sinon.stub(function(ctx, res, next) {
        console.log('service logout...');
        //process.nextTick(next);
        
        res.redirect('https://server.example.com/logout');
      })
      
      var sloServiceFactory = new Object();
      sloServiceFactory.create = sinon.stub().resolves(service);
      var authenticator = new Object();
      authenticator.authenticate = sinon.spy(authenticate);
      var store = new Object();
      var handler = factory(sloServiceFactory, authenticator, store);

      chai.express.use(handler)
        .request(function(req, res) {
          req.logout = sinon.stub().yieldsAsync(null);
          
          req.authInfo = {
            methods: [
              {
                type: 'federated',
                provider: 'https://server.example.com',
                protocol: 'openidconnect',
                idToken: 'eyJhbGci'
              }
            ]
          };
          req.session = {};
          req.connection = {};
        })
        .finish(function() {
          expect(sloServiceFactory.create).to.be.calledOnceWithExactly('https://server.example.com', 'openidconnect');
          
          expect(this).to.have.status(302);
          expect(this.getHeader('Location')).to.equal('https://server.example.com/logout');
          done();
        })
        .listen();
    }); // should logout of IDP
  
    
  }); // handler
  
});
