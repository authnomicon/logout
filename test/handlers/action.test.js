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
  });
  
});
