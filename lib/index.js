
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Preact`
 * http://www.preact.com/api
 */

var Preact = module.exports = integration('Preact')
  .endpoint('https://api.preact.io/api/v2')
  .ensure('settings.projectCode')
  .ensure('settings.apiSecret')
  .channels(['server'])
  .mapper(mapper)
  .retries(2);

/**
 * Identify.
 *
 * @param {Object} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Preact.prototype.identify = request;

/**
 * Track.
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Preact.prototype.track = request;

/**
 * Group.
 *
 * @param {Group} group
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Preact.prototype.group = request;

/**
 * Makes a request to Preact
 *
 * @param {Object} payload
 * @param {Function} fn
 * @api private
 */

function request(payload, fn){
  return this
    .post('/events')
    .auth(this.settings.projectCode, this.settings.apiSecret)
    .type('json')
    .send(payload)
    .end(this.handle(fn));
}