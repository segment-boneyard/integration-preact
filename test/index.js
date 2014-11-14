
var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var facade = require('segmentio-facade');
var mapper = require('../lib/mapper');
var time = require('unix-time');
var should = require('should');
var assert = require('assert');
var Preact = require('..');

describe('Preact', function(){
  var settings;
  var preact;
  var test;

  beforeEach(function(){
    settings = {
      projectCode: 'xzdp2lscug',
      apiSecret: 'fswi6mj6po'
    };
    preact = new Preact(settings);
    test = Test(preact, __dirname);
  });

  it('should have correct settings', function(){
    test
      .name('Preact')
      .endpoint('https://api.preact.io/api/v2')
      .ensure('settings.projectCode')
      .ensure('settings.apiSecret')
      .channels(['server'])
      .retries(2);
  });

  describe('.validate()', function(){
    it('should be invalid if .projectCode is missing', function(){
      delete settings.projectCode;
      test.invalid({}, settings);
    });

    it('should be invalid if .apiSecret is missing', function(){
      delete settings.apiSecret;
      test.invalid({}, settings);
    });

    it('should be valid with complete settings', function(){
      test.valid({}, settings);
    });
  });

  describe('mapper', function(){
    describe('identify', function(){
      it('should map basic identify', function(){
        test.maps('identify-basic');
      });
    });
    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });
    });
  });

  describe('.track()', function(){
    it('should get a good response from the API', function(done){
      var track = test.fixture('track-basic');
      test
        .set(settings)
        .identify(track.input)
        .request(1)
        .sends(track.output)
        .expects(200, done);
    });

    it('should error on invalid request', function(done){
      test
        .set({ apiSecret: 'x' })
        .track({ event: 'event' })
        .error('cannot POST /api/v2/events (400)', done);
    });
  });

  describe('.identify()', function(){
    it('should get a good response from the API', function(done){
      var identify = test.fixture('identify-basic');
      test
        .set(settings)
        .identify(identify.input)
        .sends(identify.output)
        .expects(200, done);
    });

    it('should error on invalid request', function(done){
      test
        .set({ apiSecret: 'x' })
        .identify({ userId: 'user-id' })
        .error('cannot POST /api/v2/events (400)', done);
    });
  });
});
