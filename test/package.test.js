/* global describe, it */

var expect = require('chai').expect;
var sinon = require('sinon');


describe('@authnomicon/session', function() {
  
  describe('package.json', function() {
    var json = require('../package.json');
    
    it('should have assembly metadata', function() {
      expect(json.assembly.namespace).to.equal('org.authnomicon/session');
      
      expect(json.assembly.components).to.have.length(4);
      expect(json.assembly.components).to.include('manager');
      expect(json.assembly.components).to.include('auth/scheme');
      expect(json.assembly.components).to.include('user/deserialize');
      expect(json.assembly.components).to.include('user/serialize');
    });
  });
  
});

afterEach(function() {
  sinon.restore();
});
