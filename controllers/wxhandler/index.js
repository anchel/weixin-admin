'use strict';

var Logger = require('../../lib/logger');
var log = Logger.getLogger();
var wechat_route = require('../../lib/wechat/wechat');

module.exports = function (router) {

    router.all('/', wechat_route);

};
