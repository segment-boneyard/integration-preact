
/**
 * Module dependencies.
 */

var clone = require('component-clone');
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
    event: trackEvent(track),
    source: "segmentio-server"
  };
};

/**
 * Map `group`.
 *
 * @param {Group} group
 * @return {Object}
 * @api private
 */

exports.group = function(group){
  return {
    person: groupPerson(group),
    event: groupEvent(group),
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
  var cleanTraits = clone(identify.traits());
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
}

/**
 * Format `track` to `event`.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

function trackEvent(track){
  var extras = clone(track.properties());

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
  var groupId = track.proxy('context.groupId');

  var account = {};
  
  if(groupId) {
    account.id = groupId;
  }
  
  account = extend(account, track.proxy('properties.account'));

  return reject({
    name: track.event(),
    timestamp: time(track.timestamp()),
    extras: extras,
    note: track.proxy('properties.note'),
    account: account,
    target_id: track.proxy('properties.targetId'),
    link_url: track.proxy('properties.linkUrl'),
    thumb_url: track.proxy('properties.thumbUrl'),
    revenue: is.number(revenue) ? 100 * revenue : undefined
  });
}

function groupEvent(group){
  var account = {
    id: group.groupId()
  };

  var traits = clone(group.traits());
  del(traits, "groupId");
  del(traits, "email");

  if(group.created()){
    account.customer_since = group.created().getTime() / 1000;
    del(traits, "createdAt");
    del(traits, "created");
  }
  
  account = extend(account, traits);

  return reject({
    name: "___group",
    timestamp: time(group.timestamp()),
    account: account
  });
}

function groupPerson(group){
  var person = {
    uid: group.userId(),
    email: group.email()
  };

  return reject(person);
}
