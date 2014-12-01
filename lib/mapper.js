
/**
 * Module dependencies.
 */

var time = require('unix-time');
var reject = require('reject');
var extend = require('extend');
var del = require('obj-case').del;
var is = require('is');

/**
 * Map `identify`.
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

exports.identify = function(identify){
  return {
    person: person(identify),
    event: {
      name: "___identify"
    },
    source: "segmentio-server"
  };
};

/**
 * Map `track`.
 *
 * @param {Track} track
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.track = function(track){
  return {
    person: person(track.identify()),
    event: event(track),
    source: "segmentio-server"
  };
};

/**
 * Format `identify` to `person`.
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

function person(identify){
  var cleanTraits = identify.traits();
  del(cleanTraits, "id");
  del(cleanTraits, "email");
  del(cleanTraits, "uid");
  del(cleanTraits, "name");

  return reject({
    created_at: identify.created(),
    uid: identify.userId() || identify.sessionId(),
    name: identify.name(),
    email: identify.email(),
    properties: cleanTraits,
    twitter_id: identify.proxy('traits.twitterId'),
    facebook_id: identify.proxy('traits.facebookId'),
    stripe_id: identify.proxy('traits.stripeId'),
  });
};

/**
 * Format `track` to `event`.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

function event(track){
  var extras = track.properties();

  reject(extend(extras, {
    _ua: track.userAgent(),
    _referer: track.referrer(),
    _url: track.proxy('properties.url'),
    _page_title: track.proxy('properties.pageTitle'),
    _ip: track.ip()
  }));

  del(extras, "note");
  del(extras, "account");
  del(extras, "targetId");
  del(extras, "linkUrl");
  del(extras, "thumbUrl");
  del(extras, "url");
  del(extras, "pageTitle");
  del(extras, "referrer");
  del(extras, "revenue");

  var revenue = track.revenue();

  return reject({
    name: track.event(),
    timestamp: time(track.timestamp()),
    extras: extras,
    note: track.proxy('properties.note'),
    account: track.proxy('properties.account'),
    target_id: track.proxy('properties.targetId'),
    link_url: track.proxy('properties.linkUrl'),
    thumb_url: track.proxy('properties.thumbUrl'),
    revenue: is.number(revenue) ? 100 * revenue : undefined
  });
}
