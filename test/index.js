'use strict';

var Test = require('segmentio-integration-tester');
var Preact = require('..');

describe('Preact', function() {
  var settings;
  var preact;
  var test;

  beforeEach(function() {
    settings = {
      projectCode: 'xzdp2lscug',
      apiSecret: 'fswi6mj6po'
    };
    preact = new Preact(settings);
    test = Test(preact, __dirname);
  });

  it('should have correct settings', function() {
    test
      .name('Preact')
      .endpoint('https://api.preact.io/api/v2')
      .ensure('settings.projectCode')
      .ensure('settings.apiSecret')
      .channels(['server'])
      .retries(2);
  });

  describe('.validate()', function() {
    it('should be invalid if .projectCode is missing', function() {
      delete settings.projectCode;
      test.invalid({}, settings);
    });

    it('should be invalid if .apiSecret is missing', function() {
      delete settings.apiSecret;
      test.invalid({}, settings);
    });

    it('should be valid with complete settings', function() {
      test.valid({}, settings);
    });
  });

  describe('mapper', function() {
    describe('identify', function() {
      it('should map basic identify', function() {
        test.maps('identify-basic');
      });
    });
    describe('track', function() {
      it('should map basic track', function() {
        test.maps('track-basic');
      });
    });
    describe('track', function() {
      it('should map track with groupId', function() {
        test.maps('track-groupid');
      });
    });
    describe('track', function() {
      it('should map track with account and groupId', function() {
        test.maps('track-account-and-groupid');
      });
    });
    describe('group', function() {
      it('should map basic group', function() {
        test.maps('group-basic');
      });
    });
  });

  describe('.track()', function() {
    it('should get a good response from the API', function(done) {
      var track = test.fixture('track-basic');
      test
        .set(settings)
        .track(track.input)
        .sends(track.output)
        .expects(200, done);
    });

    it('should not error on invalid request', function(done) {
      test
        .set({ apiSecret: 'x' })
        .track({ event: 'event' })
        .expects(200, done);
    });
  });

  describe('.identify()', function() {
    it('should get a good response from the API', function(done) {
      var identify = test.fixture('identify-basic');
      test
        .set(settings)
        .identify(identify.input)
        .sends(identify.output)
        .expects(200, function(err, res) {
          if (err && res) err.message = err.message + ' ' + res.text;
          done(err);
        });
    });

    it('should not error on invalid request', function(done) {
      test
        .set({ apiSecret: 'x' })
        .identify({ userId: 'user-id' })
        .expects(200, done);
    });
  });

  describe('.group()', function() {
    it('should get a good response from the API', function(done) {
      var group = test.fixture('group-basic');
      test
        .group(group.input)
        .sends(group.output)
        .set(settings)
        .expects(200, done);
    });

    it('should not error on invalid request', function(done) {
      test
        .set({ apiSecret: 'x' })
        .track({ event: 'event' })
        .expects(200, done);
    });
  });
});
