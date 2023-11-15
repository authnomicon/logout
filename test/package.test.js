/* global describe, it */

var expect = require('chai').expect;
var sinon = require('sinon');


describe('@authnomicon/logout', function() {
  
  describe('package.json', function() {
    var json = require('../package.json');
    
    it('should have assembly metadata', function() {
      expect(json.assembly.namespace).to.equal('org.authnomicon/logout');
      
      expect(json.assembly.components).to.have.length(1);
      expect(json.assembly.components).to.include('service');
    });
  });
  
});

afterEach(function() {
  sinon.restore();
});
